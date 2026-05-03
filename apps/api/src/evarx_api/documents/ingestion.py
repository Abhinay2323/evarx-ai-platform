"""Document ingestion: download from S3 → extract text → chunk → embed → write rows.

Runs as a FastAPI BackgroundTask after upload. We deliberately keep this in the
API process for Phase 2.2 — small docs (<50 pages) finish in seconds, and the
single Lightsail box has spare CPU. When volume grows we move this to a
dedicated worker (Phase 2.3+).
"""

from __future__ import annotations

import uuid

import structlog
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from evarx_api.chat.embeddings import EmbeddingError, embed_texts
from evarx_api.core.db import SessionLocal
from evarx_api.documents.chunker import chunk_text
from evarx_api.documents.extract import ExtractionError, extract_text
from evarx_api.documents.models import Document, DocumentChunk
from evarx_api.settings import get_settings
from evarx_api.storage.s3 import StorageError, download_bytes

log = structlog.get_logger()

_EMBED_BATCH = 32  # max texts per embeddings call


async def _set_status(db: AsyncSession, document_id: uuid.UUID, **values: object) -> None:
    await db.execute(
        update(Document).where(Document.id == document_id).values(**values)
    )
    await db.commit()


async def ingest_document(document_id: uuid.UUID) -> None:
    """Background entry point. Owns its own session — do NOT pass one in.

    Errors are caught and recorded on the Document row so the UI can show them;
    we never let an exception propagate (the BackgroundTask runner ignores it
    silently otherwise, and the doc would be stuck in 'queued' forever).
    """
    settings = get_settings()
    log.info("ingest.start", document_id=str(document_id))

    async with SessionLocal() as db:
        doc = await db.get(Document, document_id)
        if doc is None:
            log.warning("ingest.missing_doc", document_id=str(document_id))
            return

        try:
            await _set_status(db, document_id, status="processing", error=None)

            body = await download_bytes(key=doc.s3_key)
            text = extract_text(
                content_type=doc.content_type, filename=doc.filename, body=body
            )
            if not text.strip():
                raise ExtractionError("Document is empty after extraction")

            chunks = chunk_text(
                text,
                max_tokens=settings.chunk_max_tokens,
                overlap_tokens=settings.chunk_overlap_tokens,
            )
            if not chunks:
                raise ExtractionError("No chunks produced from document")

            # Embed in batches.
            for i in range(0, len(chunks), _EMBED_BATCH):
                batch = chunks[i : i + _EMBED_BATCH]
                vectors = await embed_texts([c.text for c in batch])
                rows = [
                    DocumentChunk(
                        document_id=doc.id,
                        org_id=doc.org_id,
                        chunk_index=c.index,
                        text=c.text,
                        token_count=c.token_count,
                        embedding=vec,
                    )
                    for c, vec in zip(batch, vectors, strict=True)
                ]
                db.add_all(rows)
                await db.commit()

            await _set_status(
                db, document_id, status="ready", chunk_count=len(chunks), error=None
            )
            log.info(
                "ingest.done",
                document_id=str(document_id),
                chunks=len(chunks),
            )
        except (ExtractionError, EmbeddingError, StorageError) as e:
            log.warning("ingest.failed", document_id=str(document_id), error=str(e))
            await _set_status(db, document_id, status="failed", error=str(e)[:1000])
        except Exception as e:
            log.exception("ingest.unexpected", document_id=str(document_id))
            await _set_status(
                db, document_id, status="failed", error=f"unexpected: {e!s}"[:1000]
            )
