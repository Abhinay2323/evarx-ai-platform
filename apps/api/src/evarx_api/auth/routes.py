"""Authenticated routes — used by the console to verify the user's session
and surface their identity to the UI."""

from fastapi import APIRouter, Depends

from evarx_api.auth.dependencies import AuthUser, get_current_user

router = APIRouter(prefix="/v1", tags=["auth"])


@router.get("/me")
async def me(user: AuthUser = Depends(get_current_user)) -> dict:
    return {
        "user_id": user.id,
        "email": user.email,
        "org_name": user.org_name,
    }
