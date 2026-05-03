"""Token-based chunker.

We tokenize with tiktoken's `cl100k_base` (a widely-portable BPE that gives a
reasonable token-count proxy across Gemini/Anthropic/OpenAI). The exact split
boundaries don't have to match the serving model's tokenizer — we only need
chunks that comfortably fit each provider's embedding context.
"""

from __future__ import annotations

from dataclasses import dataclass

import tiktoken

_ENCODER = None


def _enc():
    global _ENCODER
    if _ENCODER is None:
        _ENCODER = tiktoken.get_encoding("cl100k_base")
    return _ENCODER


@dataclass
class Chunk:
    index: int
    text: str
    token_count: int


def chunk_text(text: str, *, max_tokens: int = 800, overlap_tokens: int = 100) -> list[Chunk]:
    text = (text or "").strip()
    if not text:
        return []
    if max_tokens <= 0:
        raise ValueError("max_tokens must be > 0")
    if overlap_tokens >= max_tokens:
        raise ValueError("overlap_tokens must be < max_tokens")

    enc = _enc()
    tokens = enc.encode(text)
    chunks: list[Chunk] = []
    start = 0
    idx = 0
    step = max_tokens - overlap_tokens
    while start < len(tokens):
        window = tokens[start : start + max_tokens]
        chunk_text = enc.decode(window).strip()
        if chunk_text:
            chunks.append(Chunk(index=idx, text=chunk_text, token_count=len(window)))
            idx += 1
        if start + max_tokens >= len(tokens):
            break
        start += step
    return chunks
