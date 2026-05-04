"""Usage analytics — org-scoped aggregates over documents, chunks, and chat audit rows."""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import case, cast, func, select
from sqlalchemy.dialects.postgresql import DATE
from sqlalchemy.ext.asyncio import AsyncSession

from evarx_api.auth.bootstrap import Identity
from evarx_api.auth.dependencies import get_current_identity
from evarx_api.core.db import get_session
from evarx_api.documents.models import Document, DocumentChunk
from evarx_api.logs.models import AuditLog

router = APIRouter(prefix="/v1/usage", tags=["usage"])


class UsageSummary(BaseModel):
    documents_total: int
    documents_ready: int
    chunks_total: int
    storage_bytes: int
    queries_total: int
    queries_30d: int
    queries_this_month: int
    org_created_at: datetime


class DailyPoint(BaseModel):
    date: date
    count: int


class DailySeries(BaseModel):
    points: list[DailyPoint]


def _utc_now() -> datetime:
    return datetime.now(tz=timezone.utc)


@router.get("/summary", response_model=UsageSummary)
async def usage_summary(
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> UsageSummary:
    org_id = identity.org.id
    now = _utc_now()
    thirty_days_ago = now - timedelta(days=30)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    docs_row = (
        await db.execute(
            select(
                func.count(Document.id),
                func.coalesce(func.sum(Document.size_bytes), 0),
                func.coalesce(
                    func.sum(case((Document.status == "ready", 1), else_=0)),
                    0,
                ),
            ).where(Document.org_id == org_id)
        )
    ).one()

    chunks_total = (
        await db.execute(
            select(func.count(DocumentChunk.id)).where(DocumentChunk.org_id == org_id)
        )
    ).scalar_one()

    queries_total = (
        await db.execute(
            select(func.count(AuditLog.id)).where(
                AuditLog.org_id == org_id,
                AuditLog.action == "chat.authenticated",
            )
        )
    ).scalar_one()

    queries_30d = (
        await db.execute(
            select(func.count(AuditLog.id)).where(
                AuditLog.org_id == org_id,
                AuditLog.action == "chat.authenticated",
                AuditLog.created_at >= thirty_days_ago,
            )
        )
    ).scalar_one()

    queries_month = (
        await db.execute(
            select(func.count(AuditLog.id)).where(
                AuditLog.org_id == org_id,
                AuditLog.action == "chat.authenticated",
                AuditLog.created_at >= month_start,
            )
        )
    ).scalar_one()

    return UsageSummary(
        documents_total=int(docs_row[0] or 0),
        documents_ready=int(docs_row[2] or 0),
        chunks_total=int(chunks_total or 0),
        storage_bytes=int(docs_row[1] or 0),
        queries_total=int(queries_total or 0),
        queries_30d=int(queries_30d or 0),
        queries_this_month=int(queries_month or 0),
        org_created_at=identity.org.created_at,
    )


@router.get("/daily", response_model=DailySeries)
async def usage_daily(
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
    days: Annotated[int, Query(ge=1, le=180)] = 30,
) -> DailySeries:
    org_id = identity.org.id
    now = _utc_now()
    start = (now - timedelta(days=days - 1)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )

    day_col = cast(AuditLog.created_at, DATE).label("d")
    rows = (
        await db.execute(
            select(day_col, func.count(AuditLog.id))
            .where(
                AuditLog.org_id == org_id,
                AuditLog.action == "chat.authenticated",
                AuditLog.created_at >= start,
            )
            .group_by(day_col)
            .order_by(day_col)
        )
    ).all()

    counts: dict[date, int] = {row[0]: int(row[1]) for row in rows}

    points: list[DailyPoint] = []
    for i in range(days):
        d = (start + timedelta(days=i)).date()
        points.append(DailyPoint(date=d, count=counts.get(d, 0)))
    return DailySeries(points=points)
