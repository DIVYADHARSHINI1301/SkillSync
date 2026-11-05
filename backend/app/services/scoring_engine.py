from backend.app.config import settings
from backend.app.schemas.analysis import ScoringSummary

def format_count_phrase(count: int, singular: str, plural: str) -> str:
    """Helper to format grammar correctly (e.g. 1 skill vs 2 skills)."""
    return f"{count} {singular if count == 1 else plural}"

def calculate_match_score(
    strongly_supported_count: int,
    supported_count: int,
    limited_evidence_count: int,
    missing_count: int
) -> ScoringSummary:
    """
    Calculates the explainable match score using evidence weights:
    Strong = 1.0, Supported = 0.7, Limited = 0.3, Missing = 0.0
    Formula:
        Match Score = (Sum of Evidence Weights / Total Required Skills) * 100
    Rounded to 2 decimal places.
    """
    total_required = strongly_supported_count + supported_count + limited_evidence_count + missing_count
    
    if total_required == 0:
        return ScoringSummary(
            total_required_skills=0,
            strongly_supported_count=0,
            supported_count=0,
            limited_evidence_count=0,
            missing_count=0,
            match_score=0.00,
            score_explanation="No required skills were defined for the selected role."
        )

    weights = settings.EVIDENCE_WEIGHTS
    
    total_weight = (
        (strongly_supported_count * weights["strong"]) +
        (supported_count * weights["supported"]) +
        (limited_evidence_count * weights["limited"]) +
        (missing_count * weights["missing"])
    )
    
    raw_score = (total_weight / total_required) * 100.0
    # Bound between 0.00 and 100.00 and round to 2 decimal places
    final_score = round(max(0.00, min(100.00, raw_score)), 2)

    # Dynamic explanation generation
    strong_phrase = format_count_phrase(strongly_supported_count, "required skill", "required skills")
    supported_phrase = format_count_phrase(supported_count, "skill", "skills")
    limited_phrase = format_count_phrase(limited_evidence_count, "skill", "skills")
    missing_phrase = format_count_phrase(missing_count, "skill", "skills") if missing_count > 0 else "none"

    if missing_count > 0:
        explanation = (
            f"Your resume provides strong evidence for {strong_phrase}, "
            f"supporting evidence for {supported_phrase}, "
            f"limited evidence for {limited_phrase}, "
            f"and no evidence for {missing_phrase}. "
            f"The match score reflects these evidence levels."
        )
    else:
        explanation = (
            f"Your resume provides strong evidence for {strong_phrase}, "
            f"supporting evidence for {supported_phrase}, "
            f"and limited evidence for {limited_phrase}. "
            f"The match score reflects these evidence levels."
        )

    return ScoringSummary(
        total_required_skills=total_required,
        strongly_supported_count=strongly_supported_count,
        supported_count=supported_count,
        limited_evidence_count=limited_evidence_count,
        missing_count=missing_count,
        match_score=final_score,
        score_explanation=explanation
    )
