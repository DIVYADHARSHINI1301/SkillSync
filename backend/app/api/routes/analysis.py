from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException, status
from backend.app.schemas.analysis import AnalysisResponse, SavedAnalysisSummary
from backend.app.services.analysis_service import analysis_service
from backend.app.services.pdf_parser import (
    CorruptedPDFError, PasswordProtectedPDFError, ScannedPDFError, OversizedPDFError
)
from backend.app.repositories.supabase_repository import repository

router = APIRouter(prefix="/analysis", tags=["Resume Analysis"])

@router.post("", response_model=AnalysisResponse, status_code=status.HTTP_200_OK)
async def analyze_resume(
    file: UploadFile = File(..., description="PDF Resume document"),
    job_role_id: str = Form(..., description="Target Job Role ID from Supabase job_roles table"),
    authorization: Optional[str] = Header(None, description="Bearer token from Supabase Auth")
):
    """
    Analyzes an uploaded resume PDF against the selected job role.
    Extracts text, identifies skills, classifies evidence, calculates explainable score,
    persists records to Supabase, and returns structured result.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in to analyze your resume."
        )

    # Validate file extension
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF documents are supported (.pdf). Please upload a valid PDF."
        )

    try:
        contents = await file.read()
        return await analysis_service.run_analysis(
            file_bytes=contents,
            filename=file.filename,
            job_role_id=job_role_id.strip(),
            auth_header=authorization
        )

    except OversizedPDFError as e:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=str(e))
    except (CorruptedPDFError, PasswordProtectedPDFError, ScannedPDFError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ValueError as e:
        msg = str(e)
        if "Authentication" in msg or "token" in msg or "session" in msg:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=msg)
        if "Job role" in msg:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=msg)
    except Exception as e:
        print(f"Unexpected analysis error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during resume analysis. Please try again."
        )
    finally:
        await file.close()

@router.get("/job-roles", response_model=List[dict])
async def get_job_roles():
    """
    Returns available job roles and their required skills from Supabase or the canonical store.
    """
    return await repository.list_job_roles()

@router.get("/user/history", response_model=List[SavedAnalysisSummary])
async def get_user_analysis_history(
    authorization: Optional[str] = Header(None)
):
    """
    Retrieves the authenticated user's analysis history.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required."
        )

    try:
        user_id = await repository.verify_token_and_get_user(authorization)
        return await repository.get_user_analyses(user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        print(f"Error fetching history: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not load analysis history.")

@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Retrieves a saved analysis by ID, verifying user ownership.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required."
        )

    try:
        user_id = await repository.verify_token_and_get_user(authorization)
        analysis = await repository.get_analysis_by_id(analysis_id, user_id=user_id)
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Analysis with ID '{analysis_id}' was not found."
            )
        return analysis

    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving analysis {analysis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not retrieve analysis details."
        )
