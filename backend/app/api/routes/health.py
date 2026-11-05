from fastapi import APIRouter
from backend.app.schemas.analysis import HealthResponse
from backend.app.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint confirming that backend service is active.
    """
    return HealthResponse(
        status="ok",
        service="skillsync-backend",
        version=settings.VERSION
    )
