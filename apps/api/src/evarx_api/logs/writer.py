import hashlib
import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from evarx_api.logs.models import AuditLog


def hash_body(body: bytes | str | None) -> str | None:
    if body is None:
        return None
    if isinstance(body, str):
        body = body.encode("utf-8")
    return hashlib.sha256(body).hexdigest()


async def write_audit_log(
    db: AsyncSession,
    *,
    action: str,
    org_id: uuid.UUID | None = None,
    user_id: uuid.UUID | None = None,
    resource: str | None = None,
    request_ip: str | None = None,
    user_agent: str | None = None,
    body: bytes | str | None = None,
    status_code: int | None = None,
    meta: dict[str, Any] | None = None,
) -> AuditLog:
    """Persist a single audit-log row. Caller owns the session lifecycle."""
    entry = AuditLog(
        org_id=org_id,
        user_id=user_id,
        action=action,
        resource=resource,
        request_ip=request_ip,
        user_agent=user_agent,
        body_sha256=hash_body(body),
        status_code=status_code,
        meta=meta or {},
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry
