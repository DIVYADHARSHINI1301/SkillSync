"""
Skill insights service for Stage 3.
Generates human-readable insights and suggested actions from saved evidence classifications.
All insights are derived from actual evidence — no fabricated content.
"""
from typing import List
from backend.app.schemas.analysis import AnalysisResponse, EvidenceDetail
from backend.app.schemas.stage3 import SkillInsight, InsightsResponse

_INSIGHT_TEMPLATES = {
    "strong": {
        "insight": "{skill} is well supported in your resume with concrete implementation details. This is your strongest evidence for this skill.",
        "action_type": "none",
        "suggested_action": "No immediate action needed. Keep this description accurate and up to date as your experience grows.",
    },
    "supported": {
        "insight": "{skill} is connected to a project or experience in your resume, but the description could provide more implementation detail.",
        "action_type": "resume_improvement",
        "suggested_action": "If accurate, expand the description to explain what you built with {skill}, the specific problem it solved, and your contribution. Only include work you actually completed.",
    },
    "limited": {
        "insight": "{skill} appears in your resume's skills section but is not connected to a specific project, task, or experience description.",
        "action_type": "resume_improvement",
        "suggested_action": "If you have used {skill} in a project or coursework, add a bullet point in your Projects or Experience section describing that work. A skills list alone does not demonstrate how you applied the skill.",
    },
    "missing": {
        "insight": "No evidence of {skill} was found in your resume. This does not necessarily mean you lack this skill — it may simply not be documented.",
        "action_type": "skill_development",
        "suggested_action": "If you have experience with {skill}, add an accurate description of that work to your resume. If you have not used {skill} before, consider learning the fundamentals and completing a small project to build practical experience.",
    },
}


def generate_insights(analysis: AnalysisResponse) -> InsightsResponse:
    """
    Generates a SkillInsight for each evidence item in the analysis.
    Uses actual evidence classifications and passages — no fabrication.
    """
    insights: List[SkillInsight] = []

    strong_count = 0
    supported_count = 0
    limited_count = 0
    missing_count = 0

    for ev in analysis.evidence:
        skill = ev.skill_name
        level = ev.evidence_level
        t = _INSIGHT_TEMPLATES.get(level, _INSIGHT_TEMPLATES["missing"])

        if level == "strong":
            strong_count += 1
        elif level == "supported":
            supported_count += 1
        elif level == "limited":
            limited_count += 1
        elif level == "missing":
            missing_count += 1

        insights.append(SkillInsight(
            skill_name=skill,
            evidence_level=level,
            evidence_text=ev.evidence_text,
            explanation=ev.explanation,
            insight=t["insight"].replace("{skill}", skill),
            action_type=t["action_type"],
            suggested_action=t["suggested_action"].replace("{skill}", skill),
        ))

    return InsightsResponse(
        analysis_id=analysis.id or "",
        job_role_title=analysis.job_role_title,
        match_score=analysis.match_score,
        insights=insights,
        strong_count=strong_count,
        supported_count=supported_count,
        limited_count=limited_count,
        missing_count=missing_count,
    )
