"""Authenticated routes — used by the console to verify the user's session
and surface their identity to the UI."""

from fastapi import APIRouter, Depends

from evarx_api.auth.bootstrap import Identity
from evarx_api.auth.dependencies import (
    get_current_identity_or_pending,
    is_platform_admin_email,
)

router = APIRouter(prefix="/v1", tags=["auth"])


@router.get("/me")
async def me(
    identity: Identity = Depends(get_current_identity_or_pending),
) -> dict:
    return {
        "user_id": str(identity.user.id),
        "supabase_id": identity.auth.id,
        "email": identity.user.email,
        "status": identity.status,
        "is_platform_admin": is_platform_admin_email(identity.user.email),
        "org": (
            None
            if identity.org is None
            else {
                "id": str(identity.org.id),
                "name": identity.org.name,
                "slug": identity.org.slug,
                "plan": identity.org.plan,
                "region": identity.org.region,
            }
        ),
        "role": identity.role,
    }
