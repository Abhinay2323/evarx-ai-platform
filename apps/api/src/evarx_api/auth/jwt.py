"""Supabase JWT verification.

Supabase issues HS256-signed JWTs. The signing secret lives at
Project Settings → API → JWT Secret. We verify on every request so
expired/forged tokens are rejected before any data access happens.
"""

from typing import Any

from jose import JWTError, jwt

from evarx_api.settings import get_settings


class AuthError(Exception):
    """Raised when a token is missing, malformed, or expired."""


def decode_supabase_jwt(token: str) -> dict[str, Any]:
    settings = get_settings()
    if not settings.supabase_jwt_secret:
        raise AuthError("SUPABASE_JWT_SECRET not configured on the server")

    try:
        claims = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError as e:
        raise AuthError(f"Invalid token: {e}") from e

    if not claims.get("sub"):
        raise AuthError("Token missing subject (sub)")

    return claims
