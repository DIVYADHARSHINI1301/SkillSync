import fitz
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def create_test_pdf(text: str) -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), text)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes

def test_unauthenticated_analysis_rejected():
    pdf_bytes = create_test_pdf("Python Developer with experience in SQL.")
    response = client.post(
        "/api/analysis",
        files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
        data={"job_role_id": "6"}
    )
    assert response.status_code == 401
    assert "Authentication required" in response.json()["detail"]

def test_reject_non_pdf_upload():
    response = client.post(
        "/api/analysis",
        files={"file": ("resume.txt", b"plain text", "text/plain")},
        data={"job_role_id": "6"},
        headers={"Authorization": "Bearer demo-preview-token"}
    )
    assert response.status_code == 400
    assert "Only PDF documents are supported" in response.json()["detail"]

def test_reject_invalid_job_role_id():
    pdf_bytes = create_test_pdf("Python Developer with experience in SQL.")
    response = client.post(
        "/api/analysis",
        files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
        data={"job_role_id": "non-existent-role-99999"},
        headers={"Authorization": "Bearer demo-preview-token"}
    )
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_successful_analysis_workflow():
    resume_content = (
        "SKILLS\n"
        "Technical Skills: REST API development, Linux.\n"
        "\n"
        "EXPERIENCE\n"
        "• Developed a real-time web application using Python to automate student records.\n"
        "• Worked with SQL database schemas for data storage.\n"
        "• Used FastAPI framework for microservices.\n"
    )
    pdf_bytes = create_test_pdf(resume_content)
    
    response = client.post(
        "/api/analysis",
        files={"file": ("candidate_resume.pdf", pdf_bytes, "application/pdf")},
        data={"job_role_id": "6"},  # Python Developer role
        headers={"Authorization": "Bearer test-token-user-123"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["job_role_title"] == "Python Developer"
    assert data["match_score"] == 45.00
    assert len(data["evidence"]) == 6
    assert "Python" in data["matched_skills"]
    assert "OOP" in data["missing_skills"]
    assert data["summary"]["strongly_supported_count"] == 1
    assert data["summary"]["supported_count"] == 2
    assert data["summary"]["limited_evidence_count"] == 1
    assert data["summary"]["missing_count"] == 2
    assert "id" in data and data["id"] is not None

    analysis_id = data["id"]

    # Test retrieval by authorized owner
    get_res = client.get(
        f"/api/analysis/{analysis_id}",
        headers={"Authorization": "Bearer test-token-user-123"}
    )
    assert get_res.status_code == 200
    assert get_res.json()["id"] == analysis_id

    # Test rejection when another user attempts to retrieve this analysis
    unauth_get = client.get(
        f"/api/analysis/{analysis_id}",
        headers={"Authorization": "Bearer test-token-different-user-456"}
    )
    assert unauth_get.status_code == 403
    assert "forbidden" in unauth_get.json()["detail"].lower()

def test_reject_scanned_pdf_api():
    pdf_bytes = create_test_pdf("Hi")
    response = client.post(
        "/api/analysis",
        files={"file": ("scanned.pdf", pdf_bytes, "application/pdf")},
        data={"job_role_id": "6"},
        headers={"Authorization": "Bearer test-token-user-123"}
    )
    assert response.status_code == 400
    assert "scanned or image-based" in response.json()["detail"].lower()

def test_get_nonexistent_analysis_returns_404():
    response = client.get(
        "/api/analysis/non-existent-analysis-id-000",
        headers={"Authorization": "Bearer test-token-user-123"}
    )
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_user_history_endpoint():
    response = client.get(
        "/api/analysis/user/history",
        headers={"Authorization": "Bearer test-token-user-123"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
