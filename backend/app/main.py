from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.api.routes.health import router as health_router
from backend.app.api.routes.analysis import router as analysis_router
from backend.app.api.routes.stage3 import router as stage3_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SkillSync Stage 2 Intelligent Resume Analysis Engine Backend",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes under /api
app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(analysis_router, prefix=settings.API_PREFIX)
app.include_router(stage3_router, prefix=settings.API_PREFIX)

# Also expose top-level /health for simple probes
@app.get("/health", tags=["Health"])
async def root_health():
    return {
        "status": "ok",
        "service": "skillsync-backend",
        "version": settings.VERSION
    }

@app.get(f"{settings.API_PREFIX}/job-roles", tags=["Job Roles"])
async def api_job_roles():
    from backend.app.repositories.supabase_repository import repository
    return await repository.list_job_roles()
