from backend.app.services.skill_extractor import extract_all_skill_matches
from backend.app.services.evidence_classifier import classify_skill_evidence

def test_skills_list_classified_as_limited():
    text = (
        "TECHNICAL SKILLS\n"
        "Languages: Python, SQL, Java, Git.\n"
    )
    matches_map = extract_all_skill_matches(text)
    
    python_detail = classify_skill_evidence("Python", matches_map.get("Python"))
    assert python_detail.evidence_level == "limited"
    assert "technical skills" in python_detail.explanation.lower()
    assert "Python" in (python_detail.evidence_text or "")

def test_project_description_classified_as_strong():
    text = (
        "PROJECTS\n"
        "• Developed a real-time student attendance monitoring application using Python and PostgreSQL to automate record verification.\n"
    )
    matches_map = extract_all_skill_matches(text)
    
    python_detail = classify_skill_evidence("Python", matches_map.get("Python"))
    assert python_detail.evidence_level == "strong"
    assert "implementation details" in python_detail.explanation.lower()
    # Source passage must not be invented
    assert "Developed a real-time student attendance monitoring application" in (python_detail.evidence_text or "")

def test_brief_mention_classified_as_supported():
    text = (
        "EXPERIENCE\n"
        "• Used React for a college web portal.\n"
    )
    matches_map = extract_all_skill_matches(text)
    
    react_detail = classify_skill_evidence("React", matches_map.get("React"))
    assert react_detail.evidence_level == "supported"
    assert "Used React for a college web portal." in (react_detail.evidence_text or "")

def test_missing_skill_classification():
    text = (
        "PROJECTS\n"
        "• Built an e-commerce website using HTML, CSS, and JavaScript.\n"
    )
    matches_map = extract_all_skill_matches(text)
    
    git_detail = classify_skill_evidence("Git", matches_map.get("Git"))
    assert git_detail.evidence_level == "missing"
    assert git_detail.evidence_text is None
    assert "No evidence of Git was found" in git_detail.explanation
