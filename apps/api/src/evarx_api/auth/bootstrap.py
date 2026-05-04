"""Resolve a verified Supabase identity to local users/orgs/memberships rows.

Three paths the first time we see a user:
  1. Email matches a pending invite → auto-accept invite, full access.
  2. Email is in BOOTSTRAP_ALLOWED_EMAILS → founder, gets a fresh org.
  3. Otherwise → user row created with status=pending, no org / no membership.
     They see the awaiting-access screen until an admin invites them.

Existing users with an active membership are returned as-is. Existing pending
users stay pending unless an invite arrives or they're added to the allowlist.
"""

from __future__ import annotations

import re
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from evarx_api.auth.dependencies import AuthUser
from evarx_api.orgs.invites_models import OrgInvite
from evarx_api.orgs.models import Membership, Org, User
from evarx_api.settings import get_settings

log = structlog.get_logger()

_SLUG_RE = re.compile(r"[^a-z0-9-]+")


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


@dataclass
class Identity:
    """Fully-resolved identity. status='pending' means user has no org yet —
    only the awaiting-access endpoints work."""

    auth: AuthUser
    user: User
    org: Org | None
    role: str | None
    status: str  # active | pending


async def _accept_invite(
    db: AsyncSession, user: User, invite: OrgInvite
) -> tuple[Org, Membership]:
    org = (await db.execute(select(Org).where(Org.id == invite.org_id))).scalar_one()
    membership = Membership(
        id=uuid.uuid4(),
        org_id=invite.org_id,
        user_id=user.id,
        role=invite.role,
    )
    invite.accepted_at = _utcnow()
    invite.accepted_by = user.id
    user.status = "active"
    db.add(membership)
    return org, membership


async def _create_founder_org(
    db: AsyncSession, user: User, auth: AuthUser
) -> tuple[Org, Membership]:
    org_name = (auth.org_name or (auth.email or "").split("@")[0] or "evarx").strip()[:120]
    slug = await _unique_slug(db, _slugify(org_name))
    org = Org(id=uuid.uuid4(), name=org_name, slug=slug, plan="standard")
    membership = Membership(
        id=uuid.uuid4(),
        org=org,
        user=user,
        role="owner",
    )
    user.status = "active"
    db.add_all([org, membership])
    return org, membership


async def resolve_identity(db: AsyncSession, auth: AuthUser) -> Identity:
    settings = get_settings()
    allowlist = settings.bootstrap_allowed_emails_list
    email_lower = (auth.email or "").lower()

    user = (
        await db.execute(select(User).where(User.supabase_id == auth.id))
    ).scalar_one_or_none()

    # ---- Existing user path ----
    if user is not None:
        membership = (
            await db.execute(
                select(Membership).where(Membership.user_id == user.id).limit(1)
            )
        ).scalar_one_or_none()

        if membership is not None:
            org = (
                await db.execute(select(Org).where(Org.id == membership.org_id))
            ).scalar_one()
            return Identity(
                auth=auth,
                user=user,
                org=org,
                role=membership.role,
                status="active",
            )

        # User row exists but no membership. Try to upgrade them: invite first,
        # then allowlist. Otherwise stay pending.
        invite = (
            await db.execute(
                select(OrgInvite).where(
                    OrgInvite.email == email_lower,
                    OrgInvite.accepted_at.is_(None),
                    OrgInvite.expires_at > _utcnow(),
                )
            )
        ).scalar_one_or_none()
        if invite is not None:
            org, _membership = await _accept_invite(db, user, invite)
            await db.commit()
            await db.refresh(user)
            return Identity(
                auth=auth, user=user, org=org, role=invite.role, status="active"
            )

        if email_lower and email_lower in allowlist:
            org, _membership = await _create_founder_org(db, user, auth)
            await db.commit()
            await db.refresh(user)
            return Identity(auth=auth, user=user, org=org, role="owner", status="active")

        return Identity(auth=auth, user=user, org=None, role=None, status="pending")

    # ---- New user path ----
    if not auth.email:
        raise ValueError("Token missing email — cannot bootstrap user")

    user = User(
        id=uuid.uuid4(),
        supabase_id=auth.id,
        email=email_lower,
        full_name=None,
        status="pending",
    )
    db.add(user)
    await db.flush()  # so user.id is available for FKs below

    invite = (
        await db.execute(
            select(OrgInvite).where(
                OrgInvite.email == email_lower,
                OrgInvite.accepted_at.is_(None),
                OrgInvite.expires_at > _utcnow(),
            )
        )
    ).scalar_one_or_none()
    if invite is not None:
        org, _membership = await _accept_invite(db, user, invite)
        await db.commit()
        await db.refresh(user)
        log.info("identity.invite_accepted", user_id=str(user.id), org_id=str(org.id))
        return Identity(
            auth=auth, user=user, org=org, role=invite.role, status="active"
        )

    if email_lower in allowlist:
        org, _membership = await _create_founder_org(db, user, auth)
        await db.commit()
        await db.refresh(user)
        log.info("identity.founder_bootstrap", user_id=str(user.id), org_id=str(org.id))
        return Identity(auth=auth, user=user, org=org, role="owner", status="active")

    # Plain pending user — no org.
    await db.commit()
    await db.refresh(user)
    log.info("identity.pending_signup", user_id=str(user.id), email=email_lower)
    return Identity(auth=auth, user=user, org=None, role=None, status="pending")
