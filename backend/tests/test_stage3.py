"""
Stage 3 tests: insights, roadmap generation, comparison, learning resources, and API endpoints.
All tests use in-memory fallback — no real Supabase credentials required.
"""
import fitz
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.insights_service import generate_insights
from backend.app.services.roadmap_service import generate_recommendations, build_roadmap_response
from backend.app.services.learning_resources import get_resources_for_skill, get_resources_for_skills
from backend.app.schemas.analysis import AnalysisResponse, EvidenceDetail, ScoringSummary
from datetime import datetime, timezone

client = TestClient(app)

# ── Helpers ───────────────────────────────────────────────────────────────────

def make_analysis(evidence_levels: dict) -> AnalysisResponse:
    """Build a minimal AnalysisResponse for testing."""
    evidence = [
        EvidenceDetail(
            skill_name=skill,
            evidence_level=level,
            evidence_text="Sample passage." if level != "missing" else None,
            section_found="Projects" if level in ("strong", "supported") else None,
            explanation=f"Classified as {level}.",
        )
        for skill, level in evidence_levels.items()
    ]
    strong = sum(1 for l in evidence_levels.values() if l == "strong")
    supported = sum(1 for l in evidence_levels.values() if l == "supported")
    limited = sum(1 for l in evidence_levels.values() if l == "limited")
    missing = sum(1 for l in evidence_levels.values() if l == "missing")
    total = len(evidence_levels)
    weights = {"strong": 1.0, "supported": 0.7, "limited": 0.3, "missing": 0.0}
    score = round(sum(weights[l] for l in evidence_levels.values()) / total * 100, 2) if total else 0.0

    return AnalysisResponse(
        id="test-analysis-001",
        user_id="user-test-001",
        resume_id="resume-test-001",
        job_role_id="6",
        job_role_title="Python Developer",
        match_score=score,
        matched_skills=[s for s, l in evidence_levels.items() if l != "missing"],
        missing_skills=[s for s, l in evidence_levels.items() if l == "missing"],
        evidence=evidence,
        summary=ScoringSummary(
            total_required_skills=total,
            strongly_supported_count=strong,
            supported_count=supported,
            limited_evidence_count=limited,
            missing_count=missing,
            match_score=score,
            score_explanation="Test summary.",
        ),
        created_at=datetime.now(timezone.utc).isoformat(),
    )


def create_test_pdf(text: str) -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), text)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


# ── Insights Tests ────────────────────────────────────────────────────────────

def test_insights_all_levels_covered():
    analysis = make_analysis({"Python": "strong", "SQL": "supported", "FastAPI": "limited", "Git": "missing"})
    result = generate_insights(analysis)
    assert result.strong_count == 1
    assert result.supported_count == 1
    assert result.limited_count == 1
    assert result.missing_count == 1
    assert len(result.insights) == 4


def test_insights_strong_has_no_action():
    analysis = make_analysis({"Python": "strong"})
    result = generate_insights(analysis)
    assert result.insights[0].action_type == "none"


def test_insights_missing_does_not_claim_lack_of_ability():
    analysis = make_analysis({"Git": "missing"})
    result = generate_insights(analysis)
    insight = result.insights[0]
    assert "does not necessarily mean you lack" in insight.insight
    assert insight.action_type == "skill_development"


def test_insights_limited_suggests_resume_improvement():
    analysis = make_analysis({"SQL": "limited"})
    result = generate_insights(analysis)
    assert result.insights[0].action_type == "resume_improvement"


def test_insights_evidence_text_preserved():
    analysis = make_analysis({"Python": "strong"})
    analysis.evidence[0].evidence_text = "Built a Python API for student records."
    result = generate_insights(analysis)
    assert result.insights[0].evidence_text == "Built a Python API for student records."


# ── Roadmap Tests ─────────────────────────────────────────────────────────────

def test_roadmap_generates_for_all_levels():
    analysis = make_analysis({"Python": "strong", "SQL": "supported", "FastAPI": "limited", "Git": "missing"})
    recs = generate_recommendations(analysis.evidence)
    # missing generates 2 recs (practise + develop), others 1 each
    assert len(recs) == 5


def test_roadmap_missing_generates_both_options():
    analysis = make_analysis({"Git": "missing"})
    recs = generate_recommendations(analysis.evidence)
    categories = [r.category for r in recs]
    assert "practise_skill" in categories
    assert "develop_skill" in categories


def test_roadmap_all_recs_start_as_not_started():
    analysis = make_analysis({"Python": "strong", "SQL": "limited"})
    recs = generate_recommendations(analysis.evidence)
    assert all(r.status == "not_started" for r in recs)


def test_roadmap_progress_calculation():
    analysis = make_analysis({"Python": "strong", "SQL": "supported"})
    recs = generate_recommendations(analysis.evidence)
    recs[0].status = "completed"
    roadmap = build_roadmap_response("rm-1", "an-1", "Python Developer", 70.0, recs, datetime.now(timezone.utc).isoformat())
    assert roadmap.completed == 1
    assert roadmap.completion_percentage == 50.0


def test_roadmap_empty_evidence_safe():
    analysis = make_analysis({})
    recs = generate_recommendations(analysis.evidence)
    assert recs == []
    roadmap = build_roadmap_response("rm-2", "an-2", "Role", 0.0, recs, datetime.now(timezone.utc).isoformat())
    assert roadmap.completion_percentage == 0.0
    assert roadmap.total == 0


# ── Learning Resources Tests ──────────────────────────────────────────────────

def test_resources_returned_for_known_skill():
    resources = get_resources_for_skill("Python")
    assert len(resources) > 0
    assert all(r.skill == "Python" for r in resources)


def test_resources_urls_are_non_empty():
    for skill in ["Python", "SQL", "Git", "React", "FastAPI"]:
        for r in get_resources_for_skill(skill):
            assert r.url.startswith("https://"), f"Invalid URL for {skill}: {r.url}"


def test_resources_unknown_skill_returns_empty():
    resources = get_resources_for_skill("UnknownSkillXYZ")
    assert resources == []


def test_resources_for_multiple_skills():
    result = get_resources_for_skills(["Python", "SQL", "Git"])
    assert "Python" in result
    assert "SQL" in result
    assert "Git" in result


def test_resources_do_not_alter_evidence():
    """Fetching resources must not change any evidence classification."""
    analysis = make_analysis({"Python": "limited"})
    original_level = analysis.evidence[0].evidence_level
    get_resources_for_skill("Python")
    assert analysis.evidence[0].evidence_level == original_level


# ── API Endpoint Tests ────────────────────────────────────────────────────────

def test_stage3_insights_requires_auth():
    response = client.get("/api/stage3/insights/some-analysis-id")
    assert response.status_code == 401


def test_stage3_roadmap_create_requires_auth():
    response = client.post("/api/stage3/roadmaps?analysis_id=some-id")
    assert response.status_code == 401


def test_stage3_compare_requires_auth():
    response = client.post("/api/stage3/compare", json={"resume_id": "r1", "role_ids": ["1", "2"]})
    assert response.status_code == 401


def test_stage3_learning_resources_endpoint():
    response = client.get("/api/stage3/learning-resources/Python")
    assert response.status_code == 200
    data = response.json()
    assert data["skill"] == "Python"
    assert len(data["resources"]) > 0


def test_stage3_learning_resources_multi_endpoint():
    response = client.get("/api/stage3/learning-resources?skills=Python,SQL,Git")
    assert response.status_code == 200
    data = response.json()
    skills = [d["skill"] for d in data]
    assert "Python" in skills
    assert "SQL" in skills


def test_stage3_compare_rejects_single_role():
    response = client.post(
        "/api/stage3/compare",
        json={"resume_id": "r1", "role_ids": ["1"]},
        headers={"Authorization": "Bearer test-token-user-001"},
    )
    assert response.status_code in (401, 422)


def test_stage3_full_workflow():
    """
    Full Stage 3 workflow:
    1. Run a Stage 2 analysis to get an analysis_id
    2. Fetch insights for that analysis
    3. Create a roadmap
    4. Update a recommendation status
    5. Verify progress persists
    """
    resume_text = (
        "SKILLS\nTechnical Skills: REST API development.\n\n"
        "EXPERIENCE\n"
        "• Developed a real-time web application using Python to automate student records.\n"
        "• Worked with SQL database schemas for data storage.\n"
        "• Used FastAPI framework for microservices.\n"
    )
    pdf_bytes = create_test_pdf(resume_text)

    # Step 1: Run analysis
    analysis_resp = client.post(
        "/api/analysis",
        files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
        data={"job_role_id": "6"},
        headers={"Authorization": "Bearer test-token-stage3-user"},
    )
    assert analysis_resp.status_code == 200
    analysis_id = analysis_resp.json()["id"]
    assert analysis_id

    # Step 2: Fetch insights
    insights_resp = client.get(
        f"/api/stage3/insights/{analysis_id}",
        headers={"Authorization": "Bearer test-token-stage3-user"},
    )
    assert insights_resp.status_code == 200
    insights_data = insights_resp.json()
    assert len(insights_data["insights"]) == 6
    assert insights_data["job_role_title"] == "Python Developer"

    # Step 3: Create roadmap
    roadmap_resp = client.post(
        f"/api/stage3/roadmaps?analysis_id={analysis_id}",
        headers={"Authorization": "Bearer test-token-stage3-user"},
    )
    assert roadmap_resp.status_code == 201
    roadmap = roadmap_resp.json()
    assert roadmap["total"] > 0
    assert roadmap["completion_percentage"] == 0.0
    roadmap_id = roadmap["id"]
    first_rec_id = roadmap["recommendations"][0]["id"]

    # Step 4: Update recommendation status
    update_resp = client.patch(
        f"/api/stage3/roadmaps/{roadmap_id}/recommendations/{first_rec_id}",
        json={"status": "in_progress"},
        headers={"Authorization": "Bearer test-token-stage3-user"},
    )
    assert update_resp.status_code == 200
    updated = update_resp.json()
    updated_rec = next(r for r in updated["recommendations"] if r["id"] == first_rec_id)
    assert updated_rec["status"] == "in_progress"

    # Step 5: Fetch roadmap again — progress persists
    fetch_resp = client.get(
        f"/api/stage3/roadmaps/analysis/{analysis_id}",
        headers={"Authorization": "Bearer test-token-stage3-user"},
    )
    assert fetch_resp.status_code == 200
    fetched = fetch_resp.json()
    persisted_rec = next(r for r in fetched["recommendations"] if r["id"] == first_rec_id)
    assert persisted_rec["status"] == "in_progress"
    assert fetched["in_progress"] == 1

    # Step 6: Another user cannot access this roadmap
    unauth_resp = client.get(
        f"/api/stage3/roadmaps/analysis/{analysis_id}",
        headers={"Authorization": "Bearer test-token-different-user-999"},
    )
    assert unauth_resp.status_code == 403
