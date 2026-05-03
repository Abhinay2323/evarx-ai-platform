"""Async embedding client. Hits LiteLLM's /v1/embeddings (OpenAI-compatible).

We always reference the model by alias (`evarx-embed`); LiteLLM's config maps
that to whichever provider is current (Gemini text-embedding-004 today).
"""

from __future__ import annotations

import httpx
import structlog

from evarx_api.settings import get_settings

log = structlog.get_logger()


class EmbeddingError(Exception):
    """Raised when the embedding call fails."""


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """Returns one embedding vector per input text, in order."""
    if not texts:
        return []

    settings = get_settings()
    headers: dict[str, str] = {}
    if settings.litellm_master_key:
        headers["Authorization"] = f"Bearer {settings.litellm_master_key}"

    async with httpx.AsyncClient(
        base_url=settings.litellm_base_url,
        timeout=httpx.Timeout(120.0, connect=10.0),
        headers=headers,
    ) as client:
        resp = await client.post(
            "/v1/embeddings",
            json={"model": settings.embedding_model, "input": texts},
        )
        if resp.status_code >= 400:
            detail = resp.text[:500]
            log.warning("embed.error", status=resp.status_code, detail=detail)
            raise EmbeddingError(f"Embedding upstream error: {resp.status_code}")
        body = resp.json()

    items = sorted(body.get("data", []), key=lambda d: d.get("index", 0))
    if len(items) != len(texts):
        raise EmbeddingError(
            f"Embedding count mismatch: got {len(items)}, expected {len(texts)}"
        )
    return [item["embedding"] for item in items]


async def embed_one(text: str) -> list[float]:
    [vec] = await embed_texts([text])
    return vec
