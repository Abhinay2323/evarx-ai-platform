from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    env: str = Field(default="dev")
    log_level: str = Field(default="INFO")
    port: int = Field(default=8000)

    allowed_origins: str = Field(
        default="http://localhost:3000,http://localhost:3001"
    )

    database_url: str = Field(
        default="postgresql+asyncpg://evarx:evarx@localhost:5432/evarx"
    )
    redis_url: str = Field(default="redis://localhost:6379/0")

    # Supabase — auth wiring lands in phase 2 (alongside RAG).
    supabase_url: str | None = None
    supabase_jwt_secret: str | None = None
    supabase_service_role_key: str | None = None

    # LiteLLM proxy (phase 1)
    litellm_base_url: str = Field(default="http://litellm:4000")
    litellm_master_key: str | None = None
    gemini_api_key: str | None = None

    sentry_dsn: str | None = None

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
