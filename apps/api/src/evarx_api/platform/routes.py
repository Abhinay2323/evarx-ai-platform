"""Platform admin endpoints — Evarx team only.

Use case: Evarx (you) sells to a customer. You create their org here, seed it
with an invite for their first owner, and (optionally) email them the link.
The customer signs up at app.evarx.in/signup; the existing invite-acceptance
flow makes them owner of their new org. They invite their own teammates from
the per-org /members page from then on.
"""

from __future__ import annotations

import re
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated, Literal

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from evarx_api.auth.bootstrap import Identity
from evarx_api.auth.dependencies import require_platform_admin
from evarx_api.core.db import get_session
from evarx_api.documents.models import Document
from evarx_api.logs.writer import write_audit_log
from evarx_api.notifications.email import (
    EmailDeliveryError,
    EmailDisabled,
    send_email,
)
from evarx_api.orgs.invites_models import OrgInvite
from evarx_api.orgs.models import Membership, Org, User
from evarx_api.settings import get_settings

log = structlog.get_logger()
router = APIRouter(prefix="/v1/platform", tags=["platform"])

INVITE_TTL_DAYS = 14
_SLUG_RE = re.compile(r"[^a-z0-9-]+")
_VALID_SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,58}[a-z0-9]$|^[a-z0-9]$")


def _slugify(name: str) -> str:
    base = _SLUG_RE.sub("-", name.lower()).strip("-") or "org"
    return base[:48]


async def _unique_slug(db: AsyncSession, base: str) -> str:
    candidate = base
    suffix = 0
    while True:
        result = await db.execute(select(Org.id).where(Org.slug == candidate))
        if result.scalar_one_or_none() is None:
            return candidate
        suffix += 1
        candidate = f"{base}-{suffix}"


def _utcnow() -> datetime:
    return datetime.now(tz=timezone.utc)


# ----- Schemas ------------------------------------------------------------


class OrgSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    plan: str
    region: str
    member_count: int
    document_count: int
    created_at: datetime


class OrgCreatePayload(BaseModel):
    name: Annotated[str, Field(min_length=2, max_length=120)]
    slug: Annotated[str | None, Field(default=None, max_length=60)] = None
    plan: Literal["standard", "growth", "enterprise"] = "standard"
    owner_email: EmailStr
    send_email: bool = True


class OrgCreateResponse(BaseModel):
    org: dict
    invite: dict


class PendingUser(BaseModel):
    id: uuid.UUID
    email: str
    supabase_id: str | None
    created_at: datetime


class InviteToOrgPayload(BaseModel):
    user_id: uuid.UUID
    org_id: uuid.UUID
    role: Literal["owner", "admin", "member"] = "member"
    send_email: bool = True


# ----- Endpoints ----------------------------------------------------------


@router.get("/orgs", response_model=list[OrgSummary])
async def list_orgs(
    _identity: Identity = Depends(require_platform_admin),
    db: AsyncSession = Depends(get_session),
) -> list[OrgSummary]:
    member_subq = (
        select(Membership.org_id, func.count(Membership.id).label("c"))
        .group_by(Membership.org_id)
        .subquery()
    )
    doc_subq = (
        select(Document.org_id, func.count(Document.id).label("c"))
        .group_by(Document.org_id)
        .subquery()
    )

    rows = (
        await db.execute(
            select(
                Org,
                func.coalesce(member_subq.c.c, 0),
                func.coalesce(doc_subq.c.c, 0),
            )
            .outerjoin(member_subq, member_subq.c.org_id == Org.id)
            .outerjoin(doc_subq, doc_subq.c.org_id == Org.id)
            .order_by(Org.created_at.desc())
        )
    ).all()

    return [
        OrgSummary(
            id=org.id,
            name=org.name,
            slug=org.slug,
            plan=org.plan,
            region=org.region,
            member_count=int(member_count),
            document_count=int(doc_count),
            created_at=org.created_at,
        )
        for org, member_count, doc_count in rows
    ]


@router.post(
    "/orgs",
    response_model=OrgCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_org(
    payload: OrgCreatePayload,
    identity: Identity = Depends(require_platform_admin),
    db: AsyncSession = Depends(get_session),
) -> OrgCreateResponse:
    settings = get_settings()
    owner_email = payload.owner_email.lower().strip()
    base_slug = (payload.slug or _slugify(payload.name)).lower()
    if not _VALID_SLUG_RE.match(base_slug):
        raise HTTPException(
            status_code=400,
            detail="Slug must be lowercase letters/digits/hyphens, 1-60 chars.",
        )
    slug = await _unique_slug(db, base_slug)

    org = Org(
        id=uuid.uuid4(),
        name=payload.name.strip(),
        slug=slug,
        plan=payload.plan,
    )
    db.add(org)
    await db.flush()

    token = secrets.token_urlsafe(32)
    invite = OrgInvite(
        id=uuid.uuid4(),
        org_id=org.id,
        invited_by=identity.user.id if identity.user else None,
        email=owner_email,
        role="owner",
        token=token,
        expires_at=_utcnow() + timedelta(days=INVITE_TTL_DAYS),
    )
    db.add(invite)
    await db.commit()
    await db.refresh(org)
    await db.refresh(invite)

    try:
        await write_audit_log(
            db,
            action="platform.org_created",
            org_id=org.id,
            user_id=identity.user.id if identity.user else None,
            resource=str(org.id),
            status_code=201,
            meta={
                "plan": payload.plan,
                "owner_email": owner_email,
                "by": identity.user.email if identity.user else None,
            },
        )
    except Exception:
        log.exception("platform.org_created.audit_failed")

    accept_url = f"{settings.console_url.rstrip('/')}/invites/{token}"
    email_sent: bool | None = None
    if payload.send_email and settings.smtp_configured:
        text = (
            f"You've been invited to lead {org.name} on Evarx.\n\n"
            f"Set up your account here:\n{accept_url}\n\n"
            f"This link expires in {INVITE_TTL_DAYS} days.\n\n— Evarx"
        )
        html = f"""
<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#05060F;color:#e4e4e7;margin:0;padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#0A0C1A;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">
    <tr><td>
      <h1 style="margin:0 0 8px;font-size:20px;color:#ffffff;">Welcome to Evarx, {org.name}</h1>
      <p style="margin:0 0 16px;color:#a1a1aa;font-size:14px;line-height:1.6;">
        Your Evarx workspace has been provisioned. Click below to claim your owner account and start uploading documents.
      </p>
      <a href="{accept_url}" style="display:inline-block;background:linear-gradient(90deg,#22C48A,#3B4DFF);color:#05060F;font-weight:600;text-decoration:none;padding:12px 20px;border-radius:12px;font-size:14px;">Set up your account</a>
      <p style="margin:24px 0 0;color:#71717a;font-size:12px;">
        Link expires in {INVITE_TTL_DAYS} days. If the button doesn't work, paste this URL into your browser:<br>
        <span style="color:#a1a1aa;word-break:break-all;">{accept_url}</span>
      </p>
    </td></tr>
  </table>
</body></html>
"""
        try:
            await send_email(
                to=owner_email,
                subject=f"Welcome to Evarx — {org.name}",
                text=text,
                html=html,
            )
            email_sent = True
        except (EmailDisabled, EmailDeliveryError):
            email_sent = False
        except Exception:
            log.exception("platform.org_created.email_failed")
            email_sent = False
    elif payload.send_email and not settings.smtp_configured:
        email_sent = None

    return OrgCreateResponse(
        org={
            "id": str(org.id),
            "name": org.name,
            "slug": org.slug,
            "plan": org.plan,
            "region": org.region,
            "created_at": org.created_at.isoformat(),
        },
        invite={
            "id": str(invite.id),
            "email": invite.email,
            "role": invite.role,
            "token": invite.token,
            "expires_at": invite.expires_at.isoformat(),
            "accept_url": accept_url,
            "email_sent": email_sent,
        },
    )


@router.get("/users/pending", response_model=list[PendingUser])
async def list_pending_users(
    _identity: Identity = Depends(require_platform_admin),
    db: AsyncSession = Depends(get_session),
) -> list[PendingUser]:
    rows = (
        await db.execute(
            select(User).where(User.status == "pending").order_by(User.created_at.desc())
        )
    ).scalars().all()
    return [
        PendingUser(
            id=u.id,
            email=u.email,
            supabase_id=u.supabase_id,
            created_at=u.created_at,
        )
        for u in rows
    ]


@router.post("/invites", status_code=status.HTTP_201_CREATED)
async def invite_pending_user_to_org(
    payload: InviteToOrgPayload,
    identity: Identity = Depends(require_platform_admin),
    db: AsyncSession = Depends(get_session),
) -> dict:
    settings = get_settings()

    user = (await db.execute(select(User).where(User.id == payload.user_id))).scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    org = (await db.execute(select(Org).where(Org.id == payload.org_id))).scalar_one_or_none()
    if org is None:
        raise HTTPException(status_code=404, detail="Org not found")

    # Reuse or create invite for (org, email).
    existing = (
        await db.execute(
            select(OrgInvite).where(
                OrgInvite.org_id == org.id,
                OrgInvite.email == user.email,
                OrgInvite.accepted_at.is_(None),
            )
        )
    ).scalar_one_or_none()

    token = secrets.token_urlsafe(32)
    expires = _utcnow() + timedelta(days=INVITE_TTL_DAYS)
    if existing is not None:
        existing.token = token
        existing.role = payload.role
        existing.expires_at = expires
        existing.invited_by = identity.user.id if identity.user else None
        invite = existing
    else:
        invite = OrgInvite(
            id=uuid.uuid4(),
            org_id=org.id,
            invited_by=identity.user.id if identity.user else None,
            email=user.email,
            role=payload.role,
            token=token,
            expires_at=expires,
        )
        db.add(invite)

    await db.commit()
    await db.refresh(invite)

    accept_url = f"{settings.console_url.rstrip('/')}/invites/{token}"

    email_sent: bool | None = None
    if payload.send_email and settings.smtp_configured:
        try:
            await send_email(
                to=user.email,
                subject=f"You've been added to {org.name} on Evarx",
                text=(
                    f"You've been added to {org.name} on Evarx as a {payload.role}.\n\n"
                    f"Sign in and accept here:\n{accept_url}\n\n— Evarx"
                ),
                html=None,
            )
            email_sent = True
        except (EmailDisabled, EmailDeliveryError):
            email_sent = False
        except Exception:
            log.exception("platform.invite.email_failed")
            email_sent = False

    return {
        "invite_id": str(invite.id),
        "accept_url": accept_url,
        "email_sent": email_sent,
        "expires_at": invite.expires_at.isoformat(),
    }
