"""Public, unauthenticated demo-agent endpoint. Authenticated /v1/chat/completions
(with sessions, citations, RAG retrieval) lands in phase 2."""

import json
from collections.abc import AsyncIterator

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from evarx_api.chat.llm import LLMError, stream_chat
from evarx_api.chat.schemas import PublicChatRequest
from evarx_api.core.db import get_session
from evarx_api.core.redis import get_redis
from evarx_api.logs.writer import write_audit_log

log = structlog.get_logger()
router = APIRouter(prefix="/v1/public", tags=["public-chat"])

PUBLIC_RATE_LIMIT = 12  # requests per window per IP
PUBLIC_RATE_WINDOW = 60  # seconds

DEMO_SYSTEM_PROMPT = (
    "You are the Evarx public demo agent — a helpful but tightly scoped assistant "
    "for prospects exploring the Evarx medical AI platform. Keep answers concise. "
    "If asked about medical advice, redirect to the platform's private deployments. "
    "Never claim to access real patient data; this is a demo with no PHI."
)


async def _rate_limit_or_raise(redis: Redis, ip: str) -> None:
    key = f"rl:public-chat:{ip}"
    count = await redis.incr(key)
    if count == 1:
        await redis.expire(key, PUBLIC_RATE_WINDOW)
    if count > PUBLIC_RATE_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded ({PUBLIC_RATE_LIMIT}/{PUBLIC_RATE_WINDOW}s)",
        )


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/chat")
async def public_chat(
    payload: PublicChatRequest,
    request: Request,
    redis: Redis = Depends(get_redis),
    db: AsyncSession = Depends(get_session),
) -> StreamingResponse:
    ip = _client_ip(request)
    await _rate_limit_or_raise(redis, ip)

    messages = [{"role": "system", "content": DEMO_SYSTEM_PROMPT}] + [
        m.model_dump() for m in payload.messages
    ]

    body_bytes = payload.model_dump_json().encode("utf-8")

    async def event_stream() -> AsyncIterator[bytes]:
        finish_reason: str | None = None
        try:
            async for chunk in stream_chat(
                model=payload.model,
                messages=messages,
                temperature=payload.temperature,
                max_tokens=payload.max_tokens,
            ):
                if chunk["delta"]:
                    yield _sse({"type": "token", "delta": chunk["delta"]})
                if chunk["finish_reason"]:
                    finish_reason = chunk["finish_reason"]
            yield _sse({"type": "done", "finish_reason": finish_reason or "stop"})
        except LLMError as e:
            log.warning("public_chat.upstream_error", error=str(e))
            yield _sse({"type": "error", "message": "Upstream model unavailable"})
        except Exception as e:
            log.exception("public_chat.unexpected", error=str(e))
            yield _sse({"type": "error", "message": "Internal error"})
        finally:
            try:
                await write_audit_log(
                    db,
                    action="chat.public",
                    request_ip=ip,
                    user_agent=request.headers.get("user-agent"),
                    body=body_bytes,
                    status_code=200,
                    meta={
                        "model": payload.model,
                        "messages_count": len(payload.messages),
                        "finish_reason": finish_reason,
                    },
                )
            except Exception:
                log.exception("public_chat.audit_failed")

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


def _sse(payload: dict) -> bytes:
    return f"data: {json.dumps(payload)}\n\n".encode("utf-8")
