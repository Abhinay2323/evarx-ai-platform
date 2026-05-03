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

from evarx_api.auth.jwt import AuthError, decode_supabase_jwt

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
        claims = decode_supabase_jwt(credentials.credentials)
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
