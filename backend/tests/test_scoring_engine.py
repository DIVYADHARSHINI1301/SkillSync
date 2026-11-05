from backend.app.services.scoring_engine import calculate_match_score

def test_exact_specification_sample_score():
    """
    Test the exact prompt example from Section 13:
    6 required skills:
    - 1 Strong (Python) = 1.0
    - 2 Supported (SQL, FastAPI) = 0.7 + 0.7 = 1.4
    - 1 Limited (REST API) = 0.3
    - 2 Missing (OOP, Git) = 0.0 + 0.0 = 0.0
    Total weight = 2.7
    Score = (2.7 / 6) * 100 = 45.00%
    """
    summary = calculate_match_score(
        strongly_supported_count=1,
        supported_count=2,
        limited_evidence_count=1,
        missing_count=2
    )

    assert summary.total_required_skills == 6
    assert summary.match_score == 45.00
    assert "strong evidence for 1 required skill" in summary.score_explanation
    assert "supporting evidence for 2 skills" in summary.score_explanation
    assert "limited evidence for 1 skill" in summary.score_explanation
    assert "no evidence for 2 skills" in summary.score_explanation

def test_all_skills_missing():
    summary = calculate_match_score(
        strongly_supported_count=0,
        supported_count=0,
        limited_evidence_count=0,
        missing_count=6
    )
    assert summary.match_score == 0.00
    assert summary.total_required_skills == 6

def test_all_skills_strong():
    summary = calculate_match_score(
        strongly_supported_count=6,
        supported_count=0,
        limited_evidence_count=0,
        missing_count=0
    )
    assert summary.match_score == 100.00
    assert summary.total_required_skills == 6

def test_empty_requirements_safeguard():
    summary = calculate_match_score(
        strongly_supported_count=0,
        supported_count=0,
        limited_evidence_count=0,
        missing_count=0
    )
    assert summary.match_score == 0.00
    assert summary.total_required_skills == 0
    assert "No required skills" in summary.score_explanation
