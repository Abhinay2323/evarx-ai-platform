from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(min_length=1, max_length=8000)


class PublicChatRequest(BaseModel):
    """Public demo agent — no auth, IP-rate-limited, prompts capped."""

    messages: list[ChatMessage] = Field(min_length=1, max_length=12)
    # Optional: which engine alias to use. Public endpoint is locked to standard.
    model: Literal["evarx-standard"] = "evarx-standard"
    temperature: float = Field(default=0.2, ge=0.0, le=1.0)
    max_tokens: int = Field(default=600, ge=1, le=2000)
