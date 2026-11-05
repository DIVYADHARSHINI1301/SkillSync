from backend.app.services.matching_engine import match_resume_against_role

def test_match_resume_against_python_developer_role():
    # Resume containing:
    # Python in project with action verb -> Strong
    # SQL in project description -> Supported
    # FastAPI mentioned briefly -> Supported
    # REST API in skills list -> Limited
    # OOP not mentioned -> Missing
    # Git not mentioned -> Missing
    resume_text = (
        "SKILLS\n"
        "Technical Skills: REST API development, Linux.\n"
        "\n"
        "EXPERIENCE\n"
        "• Developed a real-time web application using Python to automate student records.\n"
        "• Worked with SQL database schemas for data storage.\n"
        "• Used FastAPI framework for microservices.\n"
    )

    required_skills = ["Python", "SQL", "FastAPI", "REST API", "OOP", "Git"]
    
    result = match_resume_against_role(
        resume_text=resume_text,
        job_role_id="6",
        job_role_title="Python Developer",
        required_skills=required_skills
    )

    assert result.strongly_supported_count == 1
    assert result.supported_count == 2
    assert result.limited_evidence_count == 1
    assert result.missing_count == 2
    
    total = (
        result.strongly_supported_count +
        result.supported_count +
        result.limited_evidence_count +
        result.missing_count
    )
    assert total == len(required_skills) == 6

    assert "Python" in result.matched_skills
    assert "SQL" in result.matched_skills
    assert "FastAPI" in result.matched_skills
    assert "REST API" in result.matched_skills
    assert "OOP" in result.missing_skills
    assert "Git" in result.missing_skills

def test_all_skills_missing_matching():
    result = match_resume_against_role(
        resume_text="Marketing specialist with public relations and copyediting experience.",
        job_role_id="6",
        job_role_title="Python Developer",
        required_skills=["Python", "SQL", "FastAPI", "REST API", "OOP", "Git"]
    )
    assert result.missing_count == 6
    assert result.strongly_supported_count == 0
    assert result.supported_count == 0
    assert result.limited_evidence_count == 0
    assert len(result.matched_skills) == 0
    assert len(result.missing_skills) == 6

def test_all_skills_strong_matching():
    resume_text = (
        "PROJECTS\n"
        "• Developed a Python service for student telemetry.\n"
        "• Designed and engineered SQL database models for high throughput transactions.\n"
        "• Implemented FastAPI microservices architecture for distributed endpoints.\n"
        "• Architected REST API gateways with role-based authentication controls.\n"
        "• Constructed OOP classes and object hierarchies for domain data modeling.\n"
        "• Managed and deployed Git version control branches across staging and production environments.\n"
    )
    result = match_resume_against_role(
        resume_text=resume_text,
        job_role_id="6",
        job_role_title="Python Developer",
        required_skills=["Python", "SQL", "FastAPI", "REST API", "OOP", "Git"]
    )
    assert result.strongly_supported_count == 6
    assert result.missing_count == 0
    assert len(result.matched_skills) == 6

def test_matching_is_deterministic():
    resume_text = (
        "EXPERIENCE\n"
        "Built web application with React and Node.js. Used SQL for data."
    )
    reqs = ["HTML", "CSS", "JavaScript", "React", "Node.js", "SQL", "Git"]
    res1 = match_resume_against_role(resume_text, "4", "Full Stack Developer", reqs)
    res2 = match_resume_against_role(resume_text, "4", "Full Stack Developer", reqs)

    assert res1.strongly_supported_count == res2.strongly_supported_count
    assert res1.supported_count == res2.supported_count
    assert res1.limited_evidence_count == res2.limited_evidence_count
    assert res1.missing_count == res2.missing_count
    assert res1.matched_skills == res2.matched_skills
    assert res1.missing_skills == res2.missing_skills
