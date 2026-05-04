"""Authenticated RAG chat — POST /v1/chat (SSE).

Pipeline per request:
  1. Embed the latest user turn.
  2. Top-k cosine retrieval over document_chunks scoped to the caller's org.
  3. Build a system prompt that injects retrieved chunks with [n] markers.
  4. Stream the model response. Citation chunks ride alongside the SSE.
"""

from __future__ import annotations

import asyncio
import json
import re
from collections.abc import AsyncIterator
from typing import Literal

import structlog
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from evarx_api.auth.bootstrap import Identity
from evarx_api.auth.dependencies import get_current_identity
from evarx_api.chat.embeddings import EmbeddingError, embed_one
from evarx_api.chat.llm import LLMError, complete_chat
from evarx_api.core.db import get_session
from evarx_api.documents.models import Document, DocumentChunk
from evarx_api.logs.writer import write_audit_log
from evarx_api.settings import get_settings

log = structlog.get_logger()
router = APIRouter(prefix="/v1", tags=["chat"])


class ChatTurn(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(min_length=1, max_length=8000)


class ChatRequest(BaseModel):
    messages: list[ChatTurn] = Field(min_length=1, max_length=20)
    model: Literal["evarx-standard"] = "evarx-standard"
    temperature: float = Field(default=0.2, ge=0.0, le=1.0)
    max_tokens: int = Field(default=1024, ge=1, le=4000)


SYSTEM_PROMPT = (
    "You are Evarx Console — a precise, sourced assistant for medical and pharma "
    "professionals working over their own private documents. Answer the user's "
    "question using ONLY the context provided below. When you make a claim, cite "
    "the supporting chunk inline like [1], [2], etc. If the context is "
    "insufficient, say so plainly — do not invent facts. Keep the tone clinical "
    "and direct."
)

NO_CONTEXT_PROMPT = (
    "You are Evarx Console. The user has not yet uploaded any documents, so you "
    "have no private context to draw from. Tell them you cannot ground answers "
    "without source documents and suggest they upload some via the Documents "
    "page. Keep the response under three sentences."
)


def _sse(payload: dict) -> bytes:
    return f"data: {json.dumps(payload)}\n\n".encode("utf-8")


_SPLIT_RE = re.compile(r"(\s+)")


def _split_for_stream(text: str) -> list[str]:
    """Split into word + whitespace tokens so the client can render with a
    typewriter feel. We preserve whitespace exactly so newlines/code blocks
    render correctly when concatenated."""
    if not text:
        return []
    parts = _SPLIT_RE.split(text)
    return [p for p in parts if p]


def _build_context_block(chunks: list[tuple[DocumentChunk, Document]]) -> str:
    lines: list[str] = []
    for i, (chunk, doc) in enumerate(chunks, start=1):
        lines.append(f"[{i}] (source: {doc.filename}, chunk #{chunk.chunk_index})")
        lines.append(chunk.text.strip())
        lines.append("")
    return "\n".join(lines)


def _citation_payload(chunks: list[tuple[DocumentChunk, Document]]) -> list[dict]:
    out: list[dict] = []
    for i, (chunk, doc) in enumerate(chunks, start=1):
        snippet = chunk.text.strip().replace("\n", " ")
        if len(snippet) > 240:
            snippet = snippet[:237] + "..."
        out.append(
            {
                "n": i,
                "document_id": str(doc.id),
                "document_filename": doc.filename,
                "chunk_index": chunk.chunk_index,
                "snippet": snippet,
            }
        )
    return out


@router.post("/chat")
async def authenticated_chat(
    payload: ChatRequest,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> StreamingResponse:
    settings = get_settings()

    last_user = next(
        (m for m in reversed(payload.messages) if m.role == "user"), None
    )
    if last_user is None:
        raise HTTPException(status_code=400, detail="No user message found")

    # 1) embed the question.
    try:
        query_vec = await embed_one(last_user.content)
    except EmbeddingError as e:
        log.warning("chat.embed_failed", error=str(e))
        raise HTTPException(status_code=503, detail="Embedding service unavailable") from e

    # 2) cosine-similarity retrieval, org-scoped, only from `ready` docs.
    rows = (
        await db.execute(
            select(DocumentChunk, Document)
            .join(Document, Document.id == DocumentChunk.document_id)
            .where(
                DocumentChunk.org_id == identity.org.id,
                Document.status == "ready",
            )
            .order_by(DocumentChunk.embedding.cosine_distance(query_vec))
            .limit(settings.rag_top_k)
        )
    ).all()
    retrieved: list[tuple[DocumentChunk, Document]] = [(r[0], r[1]) for r in rows]

    if retrieved:
        context_block = _build_context_block(retrieved)
        system = f"{SYSTEM_PROMPT}\n\nCONTEXT:\n{context_block}"
        citations = _citation_payload(retrieved)
    else:
        system = NO_CONTEXT_PROMPT
        citations = []

    messages = [{"role": "system", "content": system}] + [
        m.model_dump() for m in payload.messages
    ]

    body_bytes = payload.model_dump_json().encode("utf-8")

    async def event_stream() -> AsyncIterator[bytes]:
        finish_reason: str | None = None
        try:
            yield _sse({"type": "citations", "citations": citations})
            text = await complete_chat(
                model=payload.model,
                messages=messages,
                temperature=payload.temperature,
                max_tokens=payload.max_tokens,
            )
            # Fake-stream word by word for a typewriter feel. LiteLLM's Gemini
            # streaming parser is broken (b/list-vs-dict) so we use the
            # non-streaming completion and synthesize the SSE on our side.
            for token in _split_for_stream(text):
                yield _sse({"type": "token", "delta": token})
                await asyncio.sleep(0.012)
            finish_reason = "stop"
            yield _sse({"type": "done", "finish_reason": finish_reason})
        except LLMError as e:
            log.warning("chat.upstream_error", error=str(e))
            yield _sse({"type": "error", "message": "Upstream model unavailable"})
        except Exception:
            log.exception("chat.unexpected")
            yield _sse({"type": "error", "message": "Internal error"})
        finally:
            try:
                await write_audit_log(
                    db,
                    action="chat.authenticated",
                    org_id=identity.org.id,
                    user_id=identity.user.id,
                    body=body_bytes,
                    status_code=200,
                    meta={
                        "model": payload.model,
                        "messages_count": len(payload.messages),
                        "citation_count": len(citations),
                        "finish_reason": finish_reason,
                    },
                )
            except Exception:
                log.exception("chat.audit_failed")

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
