"""FastAPI dependencies for authenticated routes.

Use:
    @router.get("/me")
    async def me(user: AuthUser = Depends(get_current_user)):
        return {"user_id": user.id, "email": user.email}
"""

from dataclasses import dataclass
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from evarx_api.auth.jwt import AuthError, decode_supabase_jwt
from evarx_api.core.db import get_session

_bearer = HTTPBearer(auto_error=False, description="Supabase access token")


@dataclass
class AuthUser:
    """Resolved identity from a verified Supabase JWT."""

    id: str  # Supabase user UUID (claims.sub)
    email: str | None
    org_name: str | None  # from user_metadata, set at signup
    claims: dict[str, Any]


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> AuthUser:
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        claims = await decode_supabase_jwt(credentials.credentials)
    except AuthError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    metadata = claims.get("user_metadata") or {}

    return AuthUser(
        id=claims["sub"],
        email=claims.get("email"),
        org_name=metadata.get("org_name"),
        claims=claims,
    )


async def get_current_identity_or_pending(
    auth: "AuthUser" = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Resolve identity including pending users (no org yet).

    Use this only on endpoints that should be reachable by a user awaiting
    approval — currently only /v1/me.
    """
    # Lazy import to avoid circular (bootstrap imports AuthUser).
    from evarx_api.auth.bootstrap import resolve_identity

    return await resolve_identity(db, auth)


async def get_current_identity(
    identity=Depends(get_current_identity_or_pending),
):
    """Identity required + active membership. Use for any org-scoped route.
    Pending users get a 403 with a clear message."""
    if identity.status != "active" or identity.org is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Account is awaiting approval. Ask an admin of your org to send "
                "you an invite."
            ),
        )
    return identity


def is_platform_admin_email(email: str | None) -> bool:
    if not email:
        return False
    from evarx_api.settings import get_settings  # local to avoid bootstrap cycle

    return email.lower() in get_settings().bootstrap_allowed_emails_list


async def require_platform_admin(
    identity=Depends(get_current_identity_or_pending),
):
    """Gate for /v1/platform/* — Evarx team only. Platform admins are the
    emails listed in BOOTSTRAP_ALLOWED_EMAILS. They may or may not have an
    org of their own; this dep doesn't care."""
    email = identity.user.email if identity.user else None
    if not is_platform_admin_email(email):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Platform admin only",
        )
    return identity
