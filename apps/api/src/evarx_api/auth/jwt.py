"""Supabase JWT verification.

Supabase migrated new projects to asymmetric signing (ES256/RS256) with a
JWKS endpoint at `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`. Older
projects still issue HS256 tokens signed with the project's JWT Secret.
We support both: read the token's `alg` header and pick the right path.
"""

from __future__ import annotations

import asyncio
import time
from typing import Any

import httpx
import structlog
from jose import JWTError, jwt

from evarx_api.settings import get_settings

log = structlog.get_logger()


class AuthError(Exception):
    """Raised when a token is missing, malformed, or expired."""


_JWKS_TTL_SEC = 3600.0  # 1 hour
_jwks_lock = asyncio.Lock()
_jwks_cache: dict[str, Any] = {"data": None, "fetched_at": 0.0, "url": None}


async def _fetch_jwks(supabase_url: str, *, force: bool = False) -> dict[str, Any]:
    now = time.time()
    cached = _jwks_cache["data"]
    if (
        not force
        and cached is not None
        and _jwks_cache["url"] == supabase_url
        and now - _jwks_cache["fetched_at"] < _JWKS_TTL_SEC
    ):
        return cached  # type: ignore[no-any-return]

    async with _jwks_lock:
        # Double-check under lock so we don't fetch twice during a stampede.
        cached = _jwks_cache["data"]
        if (
            not force
            and cached is not None
            and _jwks_cache["url"] == supabase_url
            and time.time() - _jwks_cache["fetched_at"] < _JWKS_TTL_SEC
        ):
            return cached  # type: ignore[no-any-return]

        url = f"{supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url)
                resp.raise_for_status()
                data = resp.json()
        except httpx.HTTPError as e:
            raise AuthError(f"JWKS fetch failed: {e}") from e

        _jwks_cache["data"] = data
        _jwks_cache["fetched_at"] = time.time()
        _jwks_cache["url"] = supabase_url
        log.info("jwks.refreshed", keys=len(data.get("keys", [])))
        return data


def _find_jwk(jwks: dict[str, Any], kid: str | None) -> dict[str, Any] | None:
    keys = jwks.get("keys", [])
    if kid:
        for k in keys:
            if k.get("kid") == kid:
                return k
        return None
    # No kid in token — fall back to the first key.
    return keys[0] if keys else None


async def decode_supabase_jwt(token: str) -> dict[str, Any]:
    settings = get_settings()

    try:
        header = jwt.get_unverified_header(token)
    except JWTError as e:
        raise AuthError(f"Invalid token header: {e}") from e

    alg = header.get("alg")
    kid = header.get("kid")

    if alg == "HS256":
        # Legacy symmetric path — JWT Secret from Project Settings → API.
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

    elif alg in ("ES256", "RS256"):
        # Modern asymmetric path — verify against JWKS.
        if not settings.supabase_url:
            raise AuthError("SUPABASE_URL not configured on the server")

        jwks = await _fetch_jwks(settings.supabase_url)
        key = _find_jwk(jwks, kid)
        if key is None:
            # Keys may have rotated since last cache; force a refresh and retry.
            jwks = await _fetch_jwks(settings.supabase_url, force=True)
            key = _find_jwk(jwks, kid)
            if key is None:
                raise AuthError(f"No matching JWK for kid={kid!r}")
        try:
            claims = jwt.decode(
                token,
                key,
                algorithms=[alg],
                audience="authenticated",
            )
        except JWTError as e:
            raise AuthError(f"Invalid token: {e}") from e

    else:
        raise AuthError(f"Unsupported token alg: {alg!r}")

    if not claims.get("sub"):
        raise AuthError("Token missing subject (sub)")

    return claims
