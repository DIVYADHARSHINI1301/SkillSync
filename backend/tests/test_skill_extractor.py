from backend.app.services.skill_extractor import extract_all_skill_matches

def test_skill_extraction_and_alias_mapping():
    text = (
        "SKILLS\n"
        "Technical Skills: Python3, PostgreSQL, React.js, and Spring Boot.\n"
        "\n"
        "PROJECTS\n"
        "Built a RESTful API using FastAPI and implemented JWT authentication for user accounts."
    )
    matches = extract_all_skill_matches(text)

    # Check canonical skills were extracted
    assert "Python" in matches
    assert "SQL" in matches  # PostgreSQL mapped to canonical SQL
    assert "React" in matches # React.js mapped to React
    assert "Spring Boot" in matches
    assert "FastAPI" in matches
    assert "REST API" in matches
    assert "Authentication" in matches  # JWT mapped to Authentication

def test_avoid_partial_word_matches():
    # JavaScript should NOT match Java!
    text = "Experienced frontend engineer developing responsive websites with JavaScript and CSS."
    matches = extract_all_skill_matches(text)

    assert "JavaScript" in matches
    assert "CSS" in matches
    assert "Java" not in matches, "JavaScript was erroneously matched as Java!"

def test_no_spurious_matches_in_unrelated_words():
    # Word 'indisputable' contains 'sql' (indisputable -> indis-put-able / contains s-q-l? No, but let's test words)
    text = "Demonstrated impeccable work ethic and excellent interpersonal communication."
    matches = extract_all_skill_matches(text)

    assert len(matches) == 0

def test_target_skills_filter():
    text = "Full Stack developer proficient in Python, Java, React, SQL, and Docker."
    # Filter only for Backend Developer role skills
    target = {"Python", "SQL", "Git"}
    matches = extract_all_skill_matches(text, target_skills=target)

    assert "Python" in matches
    assert "SQL" in matches
    assert "React" not in matches
    assert "Java" not in matches
