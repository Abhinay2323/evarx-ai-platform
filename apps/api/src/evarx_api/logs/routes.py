"""Audit log read API.

Org-scoped, sorted newest-first, cursor-style pagination via `before_created_at`.
We deliberately don't expose body_sha256 or request_ip to the UI — auditor view
is for showing *what happened*, not for giving end-users tools to fingerprint
peers in their org. Both fields stay in the DB row for incident response.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from evarx_api.auth.bootstrap import Identity
from evarx_api.auth.dependencies import get_current_identity
from evarx_api.core.db import get_session
from evarx_api.logs.models import AuditLog
from evarx_api.orgs.models import User

router = APIRouter(prefix="/v1/audit-logs", tags=["audit"])

# Hard cap so a buggy UI can't pull the whole table.
_PAGE_LIMIT_MAX = 200
_PAGE_LIMIT_DEFAULT = 50


class AuditLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID | None
    user_email: str | None
    action: str
    resource: str | None
    status_code: int | None
    meta: dict
    created_at: datetime


class AuditLogPage(BaseModel):
    items: list[AuditLogRead]
    next_cursor: str | None  # ISO timestamp of the last item, or None when no more


@router.get("", response_model=AuditLogPage)
async def list_audit_logs(
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
    limit: Annotated[int, Query(ge=1, le=_PAGE_LIMIT_MAX)] = _PAGE_LIMIT_DEFAULT,
    action: Annotated[str | None, Query(max_length=64)] = None,
    since_days: Annotated[int | None, Query(ge=1, le=365)] = None,
    before_created_at: Annotated[datetime | None, Query()] = None,
) -> AuditLogPage:
    stmt = (
        select(AuditLog, User.email)
        .outerjoin(User, User.id == AuditLog.user_id)
        .where(AuditLog.org_id == identity.org.id)
        .order_by(AuditLog.created_at.desc())
        .limit(limit + 1)  # +1 to detect "is there a next page"
    )

    if action:
        stmt = stmt.where(AuditLog.action == action)
    if since_days is not None:
        cutoff = datetime.utcnow() - timedelta(days=since_days)
        stmt = stmt.where(AuditLog.created_at >= cutoff)
    if before_created_at is not None:
        stmt = stmt.where(AuditLog.created_at < before_created_at)

    rows = (await db.execute(stmt)).all()
    has_more = len(rows) > limit
    page_rows = rows[:limit]

    items = [
        AuditLogRead(
            id=row[0].id,
            user_id=row[0].user_id,
            user_email=row[1],
            action=row[0].action,
            resource=row[0].resource,
            status_code=row[0].status_code,
            meta=row[0].meta or {},
            created_at=row[0].created_at,
        )
        for row in page_rows
    ]
    next_cursor = (
        page_rows[-1][0].created_at.isoformat() if has_more and page_rows else None
    )
    return AuditLogPage(items=items, next_cursor=next_cursor)


@router.get("/actions")
async def list_actions(
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> list[str]:
    """Distinct action strings the org has emitted — drives the filter dropdown."""
    result = await db.execute(
        select(AuditLog.action)
        .where(AuditLog.org_id == identity.org.id)
        .group_by(AuditLog.action)
        .order_by(AuditLog.action)
    )
    return [r[0] for r in result.all()]
