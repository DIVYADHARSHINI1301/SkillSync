from typing import List, Optional
from fastapi import APIRouter, Header, HTTPException, status
from backend.app.schemas.stage3 import (
    InsightsResponse, CompareRolesRequest, CompareRolesResponse,
    RoleComparisonResult, RoadmapResponse, UpdateRecommendationRequest,
    LearningResourcesResponse,
)
from backend.app.repositories.supabase_repository import repository
from backend.app.services.insights_service import generate_insights
from backend.app.services.roadmap_service import (
    generate_recommendations, build_roadmap_response,
    recommendations_to_dict, recommendations_from_dict,
)
from backend.app.services.learning_resources import get_resources_for_skill, get_resources_for_skills
from backend.app.services.matching_engine import match_resume_against_role
from backend.app.services.scoring_engine import calculate_match_score
from datetime import datetime, timezone

router = APIRouter(prefix="/stage3", tags=["Stage 3 Career Intelligence"])


def _auth_header_required(authorization: Optional[str]) -> str:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Authentication required.")
    return authorization


# ── GET /api/stage3/insights/{analysis_id} ──────────────────────────────────
@router.get("/insights/{analysis_id}", response_model=InsightsResponse)
async def get_skill_insights(
    analysis_id: str,
    authorization: Optional[str] = Header(None),
):
    auth = _auth_header_required(authorization)
    try:
        user_id = await repository.verify_token_and_get_user(auth)
        analysis = await repository.get_analysis_by_id(analysis_id, user_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found.")
        return generate_insights(analysis)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Insights error: {e}")
        raise HTTPException(status_code=500, detail="Could not generate insights.")


# ── POST /api/stage3/compare ─────────────────────────────────────────────────
@router.post("/compare", response_model=CompareRolesResponse)
async def compare_roles(
    request: CompareRolesRequest,
    authorization: Optional[str] = Header(None),
):
    auth = _auth_header_required(authorization)
    try:
        user_id = await repository.verify_token_and_get_user(auth)

        # Verify resume ownership and get extracted text
        resume = await repository.get_resume_by_id(request.resume_id, user_id)
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found.")

        extracted_text = resume.get("extracted_text", "")
        if not extracted_text or len(extracted_text.strip()) < 50:
            raise HTTPException(status_code=400,
                                detail="The selected resume does not contain enough readable text for comparison.")

        # Deduplicate role IDs
        seen = set()
        unique_role_ids = [r for r in request.role_ids if not (r in seen or seen.add(r))]
        if len(unique_role_ids) < 2:
            raise HTTPException(status_code=422, detail="Please select at least 2 different job roles.")

        results: List[RoleComparisonResult] = []

        for role_id in unique_role_ids:
            role = await repository.get_job_role(role_id)
            if not role:
                raise HTTPException(status_code=404, detail=f"Job role '{role_id}' not found.")

            required_skills = role.get("required_skills", [])
            if not required_skills:
                continue

            matching = match_resume_against_role(
                resume_text=extracted_text,
                job_role_id=role_id,
                job_role_title=role["title"],
                required_skills=required_skills,
            )
            summary = calculate_match_score(
                strongly_supported_count=matching.strongly_supported_count,
                supported_count=matching.supported_count,
                limited_evidence_count=matching.limited_evidence_count,
                missing_count=matching.missing_count,
            )

            # Save each comparison analysis
            analysis_id = await repository.save_analysis(
                user_id=user_id,
                resume_id=request.resume_id,
                job_role_id=role_id,
                match_score=summary.match_score,
                matched_skills=matching.matched_skills,
                missing_skills=matching.missing_skills,
            )
            await repository.save_skill_evidence(analysis_id, matching.evidence_list)

            results.append(RoleComparisonResult(
                job_role_id=role_id,
                job_role_title=role["title"],
                analysis_id=analysis_id,
                match_score=summary.match_score,
                total_required=summary.total_required_skills,
                strong_count=matching.strongly_supported_count,
                supported_count=matching.supported_count,
                limited_count=matching.limited_evidence_count,
                missing_count=matching.missing_count,
                matched_skills=matching.matched_skills,
                missing_skills=matching.missing_skills,
            ))

        if not results:
            raise HTTPException(status_code=422, detail="No valid roles could be compared.")

        # Build summary sentence from actual data
        best = max(results, key=lambda r: r.match_score)
        worst = min(results, key=lambda r: r.match_score)
        if best.job_role_title != worst.job_role_title:
            comp_summary = (
                f"Your resume provides stronger evidence for {best.job_role_title} "
                f"({best.match_score:.2f}%) than {worst.job_role_title} "
                f"({worst.match_score:.2f}%) based on the required skills for each role."
            )
        else:
            comp_summary = f"Your resume scored {best.match_score:.2f}% for {best.job_role_title}."

        return CompareRolesResponse(
            resume_id=request.resume_id,
            results=results,
            summary=comp_summary,
            best_match_role=best.job_role_title,
            created_at=datetime.now(timezone.utc).isoformat(),
        )

    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Compare error: {e}")
        raise HTTPException(status_code=500, detail="Role comparison failed. Please try again.")


# ── POST /api/stage3/roadmaps ─────────────────────────────────────────────────
@router.post("/roadmaps", response_model=RoadmapResponse, status_code=201)
async def create_roadmap(
    analysis_id: str,
    authorization: Optional[str] = Header(None),
):
    auth = _auth_header_required(authorization)
    try:
        user_id = await repository.verify_token_and_get_user(auth)
        analysis = await repository.get_analysis_by_id(analysis_id, user_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found.")

        # Check if roadmap already exists for this analysis
        existing = await repository.get_roadmap_by_analysis(analysis_id, user_id)
        if existing:
            recs = recommendations_from_dict(existing.get("recommendations", []))
            return build_roadmap_response(
                roadmap_id=existing["id"],
                analysis_id=analysis_id,
                job_role_title=analysis.job_role_title,
                match_score=analysis.match_score,
                recommendations=recs,
                created_at=existing.get("created_at", datetime.now(timezone.utc).isoformat()),
            )

        recommendations = generate_recommendations(analysis.evidence)
        recs_data = recommendations_to_dict(recommendations)
        roadmap_id = await repository.save_roadmap(analysis_id, recs_data)
        created_at = datetime.now(timezone.utc).isoformat()

        return build_roadmap_response(
            roadmap_id=roadmap_id,
            analysis_id=analysis_id,
            job_role_title=analysis.job_role_title,
            match_score=analysis.match_score,
            recommendations=recommendations,
            created_at=created_at,
        )

    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Roadmap create error: {e}")
        raise HTTPException(status_code=500, detail="Could not create roadmap.")


# ── GET /api/stage3/roadmaps/analysis/{analysis_id} ──────────────────────────
@router.get("/roadmaps/analysis/{analysis_id}", response_model=RoadmapResponse)
async def get_roadmap_by_analysis(
    analysis_id: str,
    authorization: Optional[str] = Header(None),
):
    auth = _auth_header_required(authorization)
    try:
        user_id = await repository.verify_token_and_get_user(auth)
        analysis = await repository.get_analysis_by_id(analysis_id, user_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found.")

        row = await repository.get_roadmap_by_analysis(analysis_id, user_id)
        if not row:
            raise HTTPException(status_code=404, detail="No roadmap found for this analysis.")

        recs = recommendations_from_dict(row.get("recommendations", []))
        return build_roadmap_response(
            roadmap_id=row["id"],
            analysis_id=analysis_id,
            job_role_title=analysis.job_role_title,
            match_score=analysis.match_score,
            recommendations=recs,
            created_at=row.get("created_at", datetime.now(timezone.utc).isoformat()),
        )

    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Roadmap fetch error: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve roadmap.")


# ── PATCH /api/stage3/roadmaps/{roadmap_id}/recommendations/{rec_id} ─────────
@router.patch("/roadmaps/{roadmap_id}/recommendations/{rec_id}", response_model=RoadmapResponse)
async def update_recommendation_status(
    roadmap_id: str,
    rec_id: str,
    body: UpdateRecommendationRequest,
    authorization: Optional[str] = Header(None),
):
    auth = _auth_header_required(authorization)
    try:
        user_id = await repository.verify_token_and_get_user(auth)
        row = await repository.get_roadmap_by_id(roadmap_id, user_id)
        if not row:
            raise HTTPException(status_code=404, detail="Roadmap not found.")

        recs = recommendations_from_dict(row.get("recommendations", []))
        updated = False
        for rec in recs:
            if rec.id == rec_id:
                rec.status = body.status
                updated = True
                break

        if not updated:
            raise HTTPException(status_code=404, detail="Recommendation not found in this roadmap.")

        recs_data = recommendations_to_dict(recs)
        await repository.update_roadmap_recommendations(roadmap_id, recs_data)

        analysis_id = row.get("analysis_id", "")
        analysis = await repository.get_analysis_by_id(analysis_id, user_id)
        job_role_title = analysis.job_role_title if analysis else "Target Role"
        match_score = analysis.match_score if analysis else 0.0

        return build_roadmap_response(
            roadmap_id=roadmap_id,
            analysis_id=analysis_id,
            job_role_title=job_role_title,
            match_score=match_score,
            recommendations=recs,
            created_at=row.get("created_at", datetime.now(timezone.utc).isoformat()),
        )

    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Roadmap update error: {e}")
        raise HTTPException(status_code=500, detail="Could not update recommendation.")


# ── GET /api/stage3/learning-resources/{skill} ───────────────────────────────
@router.get("/learning-resources/{skill}", response_model=LearningResourcesResponse)
async def get_learning_resources(skill: str):
    resources = get_resources_for_skill(skill)
    return LearningResourcesResponse(skill=skill, resources=resources)


# ── GET /api/stage3/learning-resources ───────────────────────────────────────
@router.get("/learning-resources", response_model=List[LearningResourcesResponse])
async def get_learning_resources_for_skills(skills: str = ""):
    """Pass comma-separated skill names as ?skills=Python,SQL,Git"""
    if not skills:
        return []
    skill_list = [s.strip() for s in skills.split(",") if s.strip()]
    result_map = get_resources_for_skills(skill_list)
    return [LearningResourcesResponse(skill=s, resources=r) for s, r in result_map.items()]
