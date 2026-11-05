import pytest
import fitz
from backend.app.services.pdf_parser import (
    validate_and_extract_pdf_text,
    CorruptedPDFError,
    ScannedPDFError,
    OversizedPDFError
)

def create_in_memory_pdf(text: str) -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), text)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes

def test_valid_pdf_text_extraction():
    sample_text = (
        "John Doe - Software Engineer\n"
        "Experience: Developed robust REST APIs using Python and PostgreSQL.\n"
        "Projects: Built an automated student attendance system with FastAPI."
    )
    pdf_bytes = create_in_memory_pdf(sample_text)
    extracted, page_count = validate_and_extract_pdf_text(pdf_bytes, filename="resume.pdf")
    
    assert page_count == 1
    assert "Software Engineer" in extracted
    assert "FastAPI" in extracted
    assert "PostgreSQL" in extracted

def test_reject_non_pdf_file():
    with pytest.raises(CorruptedPDFError) as exc_info:
        validate_and_extract_pdf_text(b"This is just plain text, not a PDF", filename="notes.txt")
    assert "valid PDF header signature" in str(exc_info.value)

def test_reject_empty_file():
    with pytest.raises(CorruptedPDFError) as exc_info:
        validate_and_extract_pdf_text(b"", filename="empty.pdf")
    assert "empty" in str(exc_info.value)

def test_reject_scanned_or_empty_text_pdf():
    # PDF with almost no text (< 50 characters)
    pdf_bytes = create_in_memory_pdf("Hi")
    with pytest.raises(ScannedPDFError) as exc_info:
        validate_and_extract_pdf_text(pdf_bytes, filename="scanned.pdf")
    assert "scanned or image-based" in str(exc_info.value)

def test_reject_oversized_pdf():
    # Simulate oversized byte array > 5 MB
    large_bytes = b"%PDF-1.4" + (b"0" * (5 * 1024 * 1024 + 100))
    with pytest.raises(OversizedPDFError) as exc_info:
        validate_and_extract_pdf_text(large_bytes, filename="large.pdf")
    assert "exceeds the 5 MB limit" in str(exc_info.value)

def test_reject_corrupted_pdf_structure():
    # Has %PDF header but corrupted trailer/stream
    corrupted_bytes = b"%PDF-1.4\n" + b"random corrupted binary garbage that is not a real PDF trailer" * 10
    with pytest.raises(CorruptedPDFError) as exc_info:
        validate_and_extract_pdf_text(corrupted_bytes, filename="corrupt.pdf")
    assert "could not open" in str(exc_info.value).lower() or "pdf" in str(exc_info.value).lower()

def test_reject_password_protected_pdf():
    from backend.app.services.pdf_parser import PasswordProtectedPDFError
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), "Confidential Resume Data Here with Python and SQL Experience")
    encrypted_bytes = doc.tobytes(
        encryption=fitz.PDF_ENCRYPT_AES_256,
        user_pw="secret123",
        owner_pw="admin123"
    )
    doc.close()

    with pytest.raises(PasswordProtectedPDFError) as exc_info:
        validate_and_extract_pdf_text(encrypted_bytes, filename="locked_resume.pdf")
    assert "password-protected" in str(exc_info.value).lower()
