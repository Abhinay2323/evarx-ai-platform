"""Org members + invites — read for any member, write for owner/admin only."""

from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated, Literal

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from evarx_api.auth.bootstrap import Identity
from evarx_api.auth.dependencies import get_current_identity
from evarx_api.core.db import get_session
from evarx_api.logs.writer import write_audit_log
from evarx_api.orgs.invites_models import OrgInvite
from evarx_api.orgs.models import Membership, User

log = structlog.get_logger()
router = APIRouter(prefix="/v1/orgs/me", tags=["orgs"])
invites_root = APIRouter(prefix="/v1/invites", tags=["orgs"])

INVITE_TTL_DAYS = 14
ADMIN_ROLES = {"owner", "admin"}


class MemberRead(BaseModel):
    user_id: uuid.UUID
    email: str
    role: str
    created_at: datetime
    is_self: bool


class InviteCreate(BaseModel):
    email: Annotated[EmailStr, Field(max_length=255)]
    role: Literal["member", "admin"] = "member"


class InviteRead(BaseModel):
    id: uuid.UUID
    email: str
    role: str
    token: str
    created_at: datetime
    expires_at: datetime
    invited_by_email: str | None


class InviteAccept(BaseModel):
    token: Annotated[str, Field(min_length=20, max_length=64)]


class InvitePreview(BaseModel):
    org_name: str
    org_slug: str
    role: str
    email: str
    expires_at: datetime


def _ensure_admin(identity: Identity) -> None:
    if identity.role not in ADMIN_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners or admins can manage members",
        )


def _utcnow() -> datetime:
    return datetime.now(tz=timezone.utc)


@router.get("/members", response_model=list[MemberRead])
async def list_members(
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> list[MemberRead]:
    rows = (
        await db.execute(
            select(Membership, User)
            .join(User, User.id == Membership.user_id)
            .where(Membership.org_id == identity.org.id)
            .order_by(Membership.created_at.asc())
        )
    ).all()

    return [
        MemberRead(
            user_id=user.id,
            email=user.email,
            role=membership.role,
            created_at=membership.created_at,
            is_self=user.id == identity.user.id,
        )
        for membership, user in rows
    ]


@router.get("/invites", response_model=list[InviteRead])
async def list_invites(
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> list[InviteRead]:
    _ensure_admin(identity)

    inviter = aliased(User)
    rows = (
        await db.execute(
            select(OrgInvite, inviter.email)
            .outerjoin(inviter, inviter.id == OrgInvite.invited_by)
            .where(
                OrgInvite.org_id == identity.org.id,
                OrgInvite.accepted_at.is_(None),
                OrgInvite.expires_at > _utcnow(),
            )
            .order_by(OrgInvite.created_at.desc())
        )
    ).all()

    return [
        InviteRead(
            id=inv.id,
            email=inv.email,
            role=inv.role,
            token=inv.token,
            created_at=inv.created_at,
            expires_at=inv.expires_at,
            invited_by_email=inviter_email,
        )
        for inv, inviter_email in rows
    ]


@router.post("/invites", response_model=InviteRead, status_code=status.HTTP_201_CREATED)
async def create_invite(
    payload: InviteCreate,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> InviteRead:
    _ensure_admin(identity)
    email = payload.email.strip().lower()

    # Already a member?
    existing_member = (
        await db.execute(
            select(User.id)
            .join(Membership, Membership.user_id == User.id)
            .where(Membership.org_id == identity.org.id, User.email == email)
        )
    ).scalar_one_or_none()
    if existing_member is not None:
        raise HTTPException(
            status_code=409, detail=f"{email} is already a member of this org"
        )

    # Existing pending invite for the same email — refresh it instead of stacking.
    existing_invite = (
        await db.execute(
            select(OrgInvite).where(
                OrgInvite.org_id == identity.org.id,
                OrgInvite.email == email,
                OrgInvite.accepted_at.is_(None),
            )
        )
    ).scalar_one_or_none()

    token = secrets.token_urlsafe(32)
    now = _utcnow()
    expires = now + timedelta(days=INVITE_TTL_DAYS)

    if existing_invite is not None:
        existing_invite.token = token
        existing_invite.role = payload.role
        existing_invite.expires_at = expires
        existing_invite.invited_by = identity.user.id
        invite = existing_invite
    else:
        invite = OrgInvite(
            id=uuid.uuid4(),
            org_id=identity.org.id,
            invited_by=identity.user.id,
            email=email,
            role=payload.role,
            token=token,
            expires_at=expires,
        )
        db.add(invite)

    await db.commit()
    await db.refresh(invite)

    try:
        await write_audit_log(
            db,
            action="org.invite_created",
            org_id=identity.org.id,
            user_id=identity.user.id,
            resource=str(invite.id),
            status_code=201,
            meta={"email": email, "role": payload.role},
        )
    except Exception:
        log.exception("invite.audit_failed", invite_id=str(invite.id))

    return InviteRead(
        id=invite.id,
        email=invite.email,
        role=invite.role,
        token=invite.token,
        created_at=invite.created_at,
        expires_at=invite.expires_at,
        invited_by_email=identity.user.email,
    )


@router.delete("/invites/{invite_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_invite(
    invite_id: uuid.UUID,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> None:
    _ensure_admin(identity)
    invite = (
        await db.execute(
            select(OrgInvite).where(
                OrgInvite.id == invite_id,
                OrgInvite.org_id == identity.org.id,
            )
        )
    ).scalar_one_or_none()
    if invite is None:
        raise HTTPException(status_code=404, detail="Invite not found")

    await db.delete(invite)
    await db.commit()

    try:
        await write_audit_log(
            db,
            action="org.invite_revoked",
            org_id=identity.org.id,
            user_id=identity.user.id,
            resource=str(invite_id),
            status_code=204,
            meta={"email": invite.email},
        )
    except Exception:
        log.exception("invite.audit_failed", invite_id=str(invite_id))


# --- /v1/invites/* (no /orgs/me prefix — operates by token, not by caller's org) ---


@invites_root.get("/{token}/preview", response_model=InvitePreview)
async def preview_invite(
    token: str,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> InvitePreview:
    """Authenticated lookup so the invitee can see what they're accepting."""
    invite = (
        await db.execute(
            select(OrgInvite).where(OrgInvite.token == token)
        )
    ).scalar_one_or_none()
    if invite is None:
        raise HTTPException(status_code=404, detail="Invite not found")
    if invite.accepted_at is not None:
        raise HTTPException(status_code=409, detail="Invite already accepted")
    if invite.expires_at < _utcnow():
        raise HTTPException(status_code=410, detail="Invite has expired")

    from evarx_api.orgs.models import Org  # local import to avoid cycle

    org = (
        await db.execute(select(Org).where(Org.id == invite.org_id))
    ).scalar_one()

    return InvitePreview(
        org_name=org.name,
        org_slug=org.slug,
        role=invite.role,
        email=invite.email,
        expires_at=invite.expires_at,
    )


@invites_root.post("/accept", status_code=status.HTTP_204_NO_CONTENT)
async def accept_invite(
    payload: InviteAccept,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> None:
    invite = (
        await db.execute(
            select(OrgInvite).where(OrgInvite.token == payload.token)
        )
    ).scalar_one_or_none()
    if invite is None:
        raise HTTPException(status_code=404, detail="Invite not found")
    if invite.accepted_at is not None:
        raise HTTPException(status_code=409, detail="Invite already accepted")
    if invite.expires_at < _utcnow():
        raise HTTPException(status_code=410, detail="Invite has expired")
    if (identity.user.email or "").lower() != invite.email.lower():
        raise HTTPException(
            status_code=403,
            detail="Invite was sent to a different email address",
        )

    # Already a member of this org? Just mark accepted, no duplicate row.
    existing = (
        await db.execute(
            select(Membership).where(
                Membership.org_id == invite.org_id,
                Membership.user_id == identity.user.id,
            )
        )
    ).scalar_one_or_none()

    if existing is None:
        db.add(
            Membership(
                id=uuid.uuid4(),
                org_id=invite.org_id,
                user_id=identity.user.id,
                role=invite.role,
            )
        )

    invite.accepted_at = _utcnow()
    invite.accepted_by = identity.user.id
    await db.commit()

    try:
        await write_audit_log(
            db,
            action="org.invite_accepted",
            org_id=invite.org_id,
            user_id=identity.user.id,
            resource=str(invite.id),
            status_code=204,
            meta={"role": invite.role},
        )
    except Exception:
        log.exception("invite.audit_failed", invite_id=str(invite.id))
