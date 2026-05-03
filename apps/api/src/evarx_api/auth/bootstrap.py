"""Resolve a verified Supabase identity to local users/orgs/memberships rows.

First time we see a user, we provision:
  - a `users` row keyed by their Supabase UUID
  - an `orgs` row using the org_name they gave at signup (falling back to email-prefix)
  - a `memberships` row with role=owner

Subsequent calls are pure reads. This keeps signup ergonomics simple — Supabase
handles the email/password dance, our app data plane stays in our own Postgres,
and we never have to expose a separate "create org" flow for the first user.
"""

from __future__ import annotations

import re
import uuid
from dataclasses import dataclass

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from evarx_api.auth.dependencies import AuthUser
from evarx_api.orgs.models import Membership, Org, User

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


@dataclass
class Identity:
    """Fully-resolved identity: Supabase claims + local user/org rows."""

    auth: AuthUser
    user: User
    org: Org
    role: str


async def resolve_identity(db: AsyncSession, auth: AuthUser) -> Identity:
    # Existing user?
    user_row = (
        await db.execute(select(User).where(User.supabase_id == auth.id))
    ).scalar_one_or_none()

    if user_row is None:
        if not auth.email:
            raise ValueError("Token missing email — cannot bootstrap user")

        org_name = (auth.org_name or auth.email.split("@")[0]).strip()[:120]
        slug = await _unique_slug(db, _slugify(org_name))
        org = Org(id=uuid.uuid4(), name=org_name, slug=slug, plan="standard")
        user_row = User(
            id=uuid.uuid4(),
            supabase_id=auth.id,
            email=auth.email,
            full_name=None,
        )
        membership = Membership(
            id=uuid.uuid4(),
            org=org,
            user=user_row,
            role="owner",
        )
        db.add_all([org, user_row, membership])
        await db.commit()
        await db.refresh(user_row)
        await db.refresh(org)
        log.info(
            "identity.bootstrap",
            user_id=str(user_row.id),
            org_id=str(org.id),
            org_slug=slug,
        )
        return Identity(auth=auth, user=user_row, org=org, role="owner")

    # Find their first membership (Phase 2.2: assume single-org per user).
    membership = (
        await db.execute(
            select(Membership).where(Membership.user_id == user_row.id).limit(1)
        )
    ).scalar_one_or_none()

    if membership is None:
        # User row exists without a membership (rare — manual cleanup, etc).
        # Bootstrap a fresh org for them now.
        org_name = (auth.org_name or (auth.email or "").split("@")[0] or "evarx").strip()[:120]
        slug = await _unique_slug(db, _slugify(org_name))
        org = Org(id=uuid.uuid4(), name=org_name, slug=slug, plan="standard")
        membership = Membership(
            id=uuid.uuid4(),
            org=org,
            user=user_row,
            role="owner",
        )
        db.add_all([org, membership])
        await db.commit()
        await db.refresh(org)
        return Identity(auth=auth, user=user_row, org=org, role="owner")

    org = (
        await db.execute(select(Org).where(Org.id == membership.org_id))
    ).scalar_one()
    return Identity(auth=auth, user=user_row, org=org, role=membership.role)
