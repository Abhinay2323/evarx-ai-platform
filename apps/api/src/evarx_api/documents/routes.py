"""Document upload, list, delete — all org-scoped via the resolved Identity."""

from __future__ import annotations

import uuid

import structlog
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from evarx_api.auth.bootstrap import Identity
from evarx_api.auth.dependencies import get_current_identity
from evarx_api.core.db import get_session
from evarx_api.documents.ingestion import ingest_document
from evarx_api.documents.models import Document, DocumentChunk
from evarx_api.documents.schemas import DocumentRead
from evarx_api.storage.s3 import (
    StorageError,
    delete_object,
    object_key,
    upload_bytes,
)

log = structlog.get_logger()
router = APIRouter(prefix="/v1/documents", tags=["documents"])

# Phase 2.2 hard limit. Lightsail RAM is small; large docs are queued for
# the dedicated worker we'll add in 2.3.
_MAX_UPLOAD_BYTES = 25 * 1024 * 1024  # 25 MB
_ALLOWED_PREFIXES = ("application/pdf", "text/")
_ALLOWED_EXACT = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
}


def _content_type_ok(ct: str | None) -> bool:
    if not ct:
        return False
    if ct in _ALLOWED_EXACT:
        return True
    return any(ct.startswith(p) for p in _ALLOWED_PREFIXES)


@router.get("", response_model=list[DocumentRead])
async def list_documents(
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> list[Document]:
    result = await db.execute(
        select(Document)
        .where(Document.org_id == identity.org.id)
        .order_by(Document.created_at.desc())
    )
    return list(result.scalars().all())


@router.post("", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background: BackgroundTasks,
    file: UploadFile = File(...),
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> Document:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename required")
    if not _content_type_ok(file.content_type):
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported content type: {file.content_type}. "
            "Allowed: pdf, docx, txt, md",
        )

    body = await file.read()
    if not body:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(body) > _MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({len(body)} bytes); max {_MAX_UPLOAD_BYTES}",
        )

    document_id = uuid.uuid4()
    key = object_key(
        org_id=str(identity.org.id),
        document_id=str(document_id),
        filename=file.filename,
    )

    try:
        await upload_bytes(key=key, body=body, content_type=file.content_type or "application/octet-stream")
    except StorageError as e:
        log.warning("upload.s3_failed", error=str(e))
        raise HTTPException(status_code=503, detail="Storage backend unavailable") from e

    doc = Document(
        id=document_id,
        org_id=identity.org.id,
        uploaded_by=identity.user.id,
        filename=file.filename,
        content_type=file.content_type or "application/octet-stream",
        size_bytes=len(body),
        s3_key=key,
        status="queued",
        chunk_count=0,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    background.add_task(ingest_document, doc.id)
    log.info(
        "upload.queued",
        document_id=str(doc.id),
        org_id=str(identity.org.id),
        filename=file.filename,
        size=len(body),
    )
    return doc


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: uuid.UUID,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> None:
    doc = (
        await db.execute(
            select(Document).where(
                Document.id == document_id,
                Document.org_id == identity.org.id,
            )
        )
    ).scalar_one_or_none()
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")

    s3_key = doc.s3_key

    # Cascade deletes chunks via FK ON DELETE CASCADE; do it explicitly here too
    # so the primary delete row isn't orphaned by a future schema change.
    await db.execute(
        delete(DocumentChunk).where(DocumentChunk.document_id == document_id)
    )
    await db.delete(doc)
    await db.commit()

    try:
        await delete_object(key=s3_key)
    except StorageError as e:
        # The DB row is already gone; swallow but log so we can manually GC.
        log.warning(
            "delete.s3_orphan",
            document_id=str(document_id),
            s3_key=s3_key,
            error=str(e),
        )
