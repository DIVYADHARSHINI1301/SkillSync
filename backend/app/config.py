import os
from typing import Dict
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        extra="ignore",
    )

    PROJECT_NAME: str = "SkillSync Analysis Engine"
    VERSION: str = "0.2.0"
    API_PREFIX: str = "/api"

    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_ANON_KEY: str = ""

    # CORS — stored as a plain comma-separated string so pydantic-settings
    # never tries to JSON-parse it. Converted to a list in model_post_init.
    CORS_ORIGINS_STR: str = (
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:3000,http://127.0.0.1:3000,"
        "https://skillsync.vercel.app"
    )

    # File limits
    MAX_FILE_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB
    MIN_EXTRACTABLE_TEXT_CHARS: int = 50

    # Explainable Evidence Weights
    # These are heuristic initial values and have not been scientifically validated.
    EVIDENCE_WEIGHTS: Dict[str, float] = {
        "strong": 1.0,
        "supported": 0.7,
        "limited": 0.3,
        "missing": 0.0,
    }

    # Populated in model_post_init — use this everywhere in the app
    CORS_ORIGINS: list = []

    def model_post_init(self, __context):
        # Parse CORS list from the plain string field
        self.CORS_ORIGINS = [
            o.strip() for o in self.CORS_ORIGINS_STR.split(",") if o.strip()
        ]
        # Fall back to VITE_ prefixed vars if backend-specific vars are empty
        if not self.SUPABASE_URL:
            self.SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "")
        if not self.SUPABASE_ANON_KEY:
            self.SUPABASE_ANON_KEY = os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY", "")


settings = Settings()
