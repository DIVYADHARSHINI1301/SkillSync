import fitz  # PyMuPDF
from typing import Tuple
from backend.app.config import settings
from backend.app.utils.text_normalizer import clean_text

class PDFParsingError(Exception):
    """Base error for PDF parsing issues."""
    pass

class CorruptedPDFError(PDFParsingError):
    """Raised when PDF file is invalid or corrupted."""
    pass

class PasswordProtectedPDFError(PDFParsingError):
    """Raised when PDF file is encrypted with a password."""
    pass

class ScannedPDFError(PDFParsingError):
    """Raised when PDF does not contain sufficient selectable text."""
    pass

class OversizedPDFError(PDFParsingError):
    """Raised when PDF exceeds the allowed file size."""
    pass

def validate_and_extract_pdf_text(file_bytes: bytes, filename: str = "resume.pdf") -> Tuple[str, int]:
    """
    Validates the uploaded PDF bytes and extracts readable text across all pages.
    Returns:
        Tuple[str, int]: (cleaned_extracted_text, page_count)
    Raises:
        OversizedPDFError, CorruptedPDFError, PasswordProtectedPDFError, ScannedPDFError
    """
    # 1. Check size limit
    if len(file_bytes) > settings.MAX_FILE_SIZE_BYTES:
        raise OversizedPDFError(
            f"The uploaded file exceeds the 5 MB limit (Current: {len(file_bytes) / (1024*1024):.2f} MB)."
        )

    if len(file_bytes) == 0:
        raise CorruptedPDFError("The uploaded PDF file is empty (0 bytes).")

    # 2. Check magic bytes (%PDF-)
    if not file_bytes.startswith(b"%PDF"):
        raise CorruptedPDFError(
            f"File '{filename}' does not have a valid PDF header signature (%PDF)."
        )

    # 3. Attempt opening with PyMuPDF
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as e:
        raise CorruptedPDFError(f"Could not open '{filename}' as a PDF: {str(e)}")

    try:
        # Check if password protected
        if doc.is_encrypted:
            raise PasswordProtectedPDFError(
                "The uploaded PDF is password-protected. Please upload an unprotected PDF."
            )

        page_count = len(doc)
        if page_count == 0:
            raise CorruptedPDFError("The PDF document contains zero pages.")

        extracted_text_chunks = []
        for page_num in range(page_count):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            if text:
                extracted_text_chunks.append(text)

        raw_text = "\n".join(extracted_text_chunks)
        cleaned = clean_text(raw_text)

        # 4. Check for scanned/image-based PDF (insufficient extractable text)
        if len(cleaned.strip()) < settings.MIN_EXTRACTABLE_TEXT_CHARS:
            raise ScannedPDFError(
                "We couldn't find enough readable text in this PDF. It may be a scanned or image-based document. "
                "Please upload a text-based PDF containing selectable text."
            )

        return cleaned, page_count

    finally:
        doc.close()
