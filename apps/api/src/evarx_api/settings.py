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

    # Model aliases — keep code referencing aliases, swap providers in litellm/config.yaml.
    embedding_model: str = Field(default="evarx-embed")
    embedding_dim: int = Field(default=768)
    chat_model: str = Field(default="evarx-standard")

    # S3 (phase 2.2 — document storage for RAG)
    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None
    aws_region: str = Field(default="ap-south-1")
    s3_bucket: str | None = None

    # RAG knobs
    chunk_max_tokens: int = Field(default=800)
    chunk_overlap_tokens: int = Field(default=100)
    rag_top_k: int = Field(default=6)

    # SMTP (Phase 2.4 — invite emails). All optional; missing creds disable email
    # delivery and fall back to admin-shares-link mode.
    smtp_host: str | None = None
    smtp_port: int = Field(default=587)
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_from: str | None = None  # "Evarx <noreply@evarx.in>"
    smtp_use_tls: bool = Field(default=True)  # STARTTLS
    smtp_use_ssl: bool = Field(default=False)  # SMTPS (port 465)

    console_url: str = Field(default="https://app.evarx.in")

    sentry_dsn: str | None = None

    @property
    def smtp_configured(self) -> bool:
        return bool(self.smtp_host and self.smtp_from)

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
