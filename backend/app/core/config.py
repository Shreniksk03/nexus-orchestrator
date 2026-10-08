from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Nexus Orchestrator"
    VERSION: str = "1.0.0"

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    # Supabase (PostgreSQL)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None

    # Nebius Token Factory (OpenAI-compatible)
    NEBIUS_API_KEY: Optional[str] = None
    NEBIUS_BASE_URL: str = "https://api.studio.nebius.ai/v1/"
    
    # Model Configurations
    ROUTER_MODEL: str = "nvidia/llama-3.1-nemotron-70b-instruct"
    RESEARCHER_MODEL: str = "nvidia/llama-3.1-nemotron-70b-instruct"
    ANALYST_MODEL: str = "nvidia/llama-3.1-nemotron-70b-instruct"

    # Tavily Search API
    TAVILY_API_KEY: Optional[str] = None

    # Default n8n webhook settings
    DEFAULT_WEBHOOK_URL: str = ""
    DEFAULT_ALERT_THRESHOLD: int = 70

    # Local fallback DB path if Supabase is not configured
    SQLITE_DB_PATH: str = "nexus_orchestrator.db"


settings = Settings()
