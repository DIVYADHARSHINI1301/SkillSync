"""
Roadmap generation service for Stage 3.
Converts saved analysis evidence into a structured, actionable skill-development roadmap.
All recommendations are derived from actual evidence classifications — no fabricated content.
"""
import uuid
from typing import List, Dict, Any
from backend.app.schemas.analysis import AnalysisResponse, EvidenceDetail
from backend.app.schemas.stage3 import RoadmapRecommendation, RoadmapResponse

# Per-skill, per-level action templates.
# These are deterministic rule-based templates — not AI-generated.
# The skill name is substituted at generation time.

_ACTIONS: Dict[str, Dict[str, Dict[str, str]]] = {
    "strong": {
        "goal": "Maintain and showcase this skill effectively.",
        "action": "Your resume already demonstrates {skill} with meaningful project evidence. Ensure the description remains accurate and up to date.",
        "activity": "Review the supporting passage and confirm it accurately reflects your contribution.",
        "expected_outcome": "A clear, accurate description of how you applied {skill} in a real context.",
        "category": "improve_evidence",
    },
    "supported": {
        "goal": "Strengthen the project description for {skill} to provide clearer implementation detail.",
        "action": "Your resume connects {skill} to a project or experience, but the description could be more specific. If accurate, add details about what you built, the problem it solved, and your specific contribution.",
        "activity": "Revisit the relevant project or experience entry and expand the description with concrete implementation details.",
        "expected_outcome": "A more detailed description that clearly demonstrates how you applied {skill}.",
        "category": "improve_evidence",
    },
    "limited": {
        "goal": "Move {skill} from a skills list into a meaningful project or experience description.",
        "action": "Your resume lists {skill} but does not connect it to a specific project or task. If you have used {skill} in a project, coursework, or internship, describe that work accurately in your Projects or Experience section.",
        "activity": "Identify a project or task where you used {skill}. Write 1–2 bullet points describing what you built, the tools you used, and the outcome.",
        "expected_outcome": "At least one project or experience entry that demonstrates how you applied {skill} in practice.",
        "category": "improve_evidence",
    },
    "missing_practise": {
        "goal": "Demonstrate {skill} through a practical project if you already have experience with it.",
        "action": "Your resume does not currently provide evidence of {skill}. If you have used {skill} before, add an accurate description of that work to your Projects or Experience section.",
        "activity": "Build or document a small project that uses {skill}. Describe the functionality, your implementation approach, and the result.",
        "expected_outcome": "A resume entry that provides clear evidence of your {skill} experience.",
        "category": "practise_skill",
    },
    "missing_develop": {
        "goal": "Learn {skill} and build a small project to demonstrate it.",
        "action": "Your resume does not currently provide evidence of {skill}. If you have not used {skill} before, consider learning the fundamentals and completing a small practical exercise.",
        "activity": "Follow the recommended learning resources for {skill}. Once you have completed a small project, document it accurately in your resume.",
        "expected_outcome": "A foundational understanding of {skill} and a resume entry describing a project where you applied it.",
        "category": "develop_skill",
    },
}


def _fill(template: str, skill: str) -> str:
    return template.replace("{skill}", skill)


def generate_recommendations(evidence_list: List[EvidenceDetail]) -> List[RoadmapRecommendation]:
    """
    Generates a list of RoadmapRecommendation objects from evidence classifications.
    Strong evidence → maintenance note.
    Supported → improve description.
    Limited → move from skills list to project context.
    Missing → practise or develop (both options presented).
    """
    recommendations: List[RoadmapRecommendation] = []

    for ev in evidence_list:
        skill = ev.skill_name
        level = ev.evidence_level

        if level == "strong":
            t = _ACTIONS["strong"]
            recommendations.append(RoadmapRecommendation(
                id=str(uuid.uuid4()),
                skill_name=skill,
                evidence_level=level,
                category="improve_evidence",
                goal=_fill(t["goal"], skill),
                action=_fill(t["action"], skill),
                activity=_fill(t["activity"], skill),
                expected_outcome=_fill(t["expected_outcome"], skill),
                status="not_started",
            ))

        elif level == "supported":
            t = _ACTIONS["supported"]
            recommendations.append(RoadmapRecommendation(
                id=str(uuid.uuid4()),
                skill_name=skill,
                evidence_level=level,
                category="improve_evidence",
                goal=_fill(t["goal"], skill),
                action=_fill(t["action"], skill),
                activity=_fill(t["activity"], skill),
                expected_outcome=_fill(t["expected_outcome"], skill),
                status="not_started",
            ))

        elif level == "limited":
            t = _ACTIONS["limited"]
            recommendations.append(RoadmapRecommendation(
                id=str(uuid.uuid4()),
                skill_name=skill,
                evidence_level=level,
                category="improve_evidence",
                goal=_fill(t["goal"], skill),
                action=_fill(t["action"], skill),
                activity=_fill(t["activity"], skill),
                expected_outcome=_fill(t["expected_outcome"], skill),
                status="not_started",
            ))

        elif level == "missing":
            # Provide both options: practise existing experience OR develop the skill
            t = _ACTIONS["missing_practise"]
            recommendations.append(RoadmapRecommendation(
                id=str(uuid.uuid4()),
                skill_name=skill,
                evidence_level=level,
                category="practise_skill",
                goal=_fill(t["goal"], skill),
                action=_fill(t["action"], skill),
                activity=_fill(t["activity"], skill),
                expected_outcome=_fill(t["expected_outcome"], skill),
                status="not_started",
            ))
            t2 = _ACTIONS["missing_develop"]
            recommendations.append(RoadmapRecommendation(
                id=str(uuid.uuid4()),
                skill_name=skill,
                evidence_level=level,
                category="develop_skill",
                goal=_fill(t2["goal"], skill),
                action=_fill(t2["action"], skill),
                activity=_fill(t2["activity"], skill),
                expected_outcome=_fill(t2["expected_outcome"], skill),
                status="not_started",
            ))

    return recommendations


def build_roadmap_response(
    roadmap_id: str,
    analysis_id: str,
    job_role_title: str,
    match_score: float,
    recommendations: List[RoadmapRecommendation],
    created_at: str,
) -> RoadmapResponse:
    total = len(recommendations)
    not_started = sum(1 for r in recommendations if r.status == "not_started")
    in_progress = sum(1 for r in recommendations if r.status == "in_progress")
    completed = sum(1 for r in recommendations if r.status == "completed")
    pct = round((completed / total * 100), 1) if total > 0 else 0.0

    return RoadmapResponse(
        id=roadmap_id,
        analysis_id=analysis_id,
        job_role_title=job_role_title,
        match_score=match_score,
        recommendations=recommendations,
        total=total,
        not_started=not_started,
        in_progress=in_progress,
        completed=completed,
        completion_percentage=pct,
        created_at=created_at,
    )


def recommendations_to_dict(recommendations: List[RoadmapRecommendation]) -> List[Dict]:
    return [r.model_dump() for r in recommendations]


def recommendations_from_dict(data: List[Dict]) -> List[RoadmapRecommendation]:
    return [RoadmapRecommendation(**r) for r in data]
