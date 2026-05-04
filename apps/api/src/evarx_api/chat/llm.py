"""Thin async client around the LiteLLM proxy. We talk to LiteLLM via the
OpenAI-compatible REST API rather than the python SDK so the backend stays
provider-agnostic and easy to swap (vLLM directly, Anthropic SDK, etc.)."""

import json
from collections.abc import AsyncIterator
from typing import Any

import httpx
import structlog

from evarx_api.settings import get_settings

log = structlog.get_logger()
settings = get_settings()


class LLMError(Exception):
    """Raised when the LiteLLM proxy returns a non-2xx or malformed response."""


def _client() -> httpx.AsyncClient:
    headers: dict[str, str] = {"Accept": "text/event-stream"}
    if settings.litellm_master_key:
        headers["Authorization"] = f"Bearer {settings.litellm_master_key}"
    return httpx.AsyncClient(
        base_url=settings.litellm_base_url, timeout=httpx.Timeout(60.0, connect=10.0), headers=headers
    )


async def complete_chat(
    *,
    model: str,
    messages: list[dict[str, str]],
    temperature: float,
    max_tokens: int,
) -> str:
    """Non-streaming completion. Returns the full assistant text.

    We use this for the authenticated /v1/chat path because LiteLLM's Gemini
    streaming parser currently mis-parses Google's final chunk shape (it can
    arrive as a list, the parser expects a dict). Non-streaming sidesteps that
    entirely; we fake the typewriter effect on the SSE side.
    """
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False,
    }
    async with _client() as client:
        resp = await client.post("/v1/chat/completions", json=payload)
        if resp.status_code >= 400:
            detail = resp.text[:500]
            log.warning("litellm.error", status=resp.status_code, detail=detail)
            raise LLMError(f"LiteLLM upstream error: {resp.status_code}")
        body = resp.json()
    try:
        return body["choices"][0]["message"]["content"] or ""
    except (KeyError, IndexError, TypeError) as e:
        raise LLMError(f"Malformed completion response: {e}") from e


async def stream_chat(
    *,
    model: str,
    messages: list[dict[str, str]],
    temperature: float,
    max_tokens: int,
) -> AsyncIterator[dict[str, Any]]:
    """Yields parsed delta objects from LiteLLM's OpenAI-style SSE.

    Each yielded dict is one chunk's `choices[0].delta` plus a `finish_reason`
    when the stream ends. Final element will have `finish_reason` set.
    """
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": True,
    }

    async with _client() as client:
        async with client.stream("POST", "/v1/chat/completions", json=payload) as resp:
            if resp.status_code >= 400:
                detail = (await resp.aread()).decode("utf-8", errors="replace")[:500]
                log.warning("litellm.error", status=resp.status_code, detail=detail)
                raise LLMError(f"LiteLLM upstream error: {resp.status_code}")

            async for line in resp.aiter_lines():
                if not line or not line.startswith("data: "):
                    continue
                data = line.removeprefix("data: ").strip()
                if data == "[DONE]":
                    return
                try:
                    chunk = json.loads(data)
                except json.JSONDecodeError:
                    continue
                if not chunk.get("choices"):
                    continue
                choice = chunk["choices"][0]
                yield {
                    "delta": choice.get("delta", {}).get("content", ""),
                    "finish_reason": choice.get("finish_reason"),
                }
