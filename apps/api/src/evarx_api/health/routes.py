from fastapi import APIRouter, Depends
from redis.asyncio import Redis
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from evarx_api import __version__
from evarx_api.core.db import get_session
from evarx_api.core.redis import get_redis

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    """Liveness probe — process is up. No deps checked."""
    return {"status": "ok", "version": __version__}


@router.get("/ready")
async def ready(
    db: AsyncSession = Depends(get_session),
    redis: Redis = Depends(get_redis),
) -> dict[str, str]:
    """Readiness probe — verifies Postgres and Redis are reachable."""
    await db.execute(text("SELECT 1"))
    await redis.ping()
    return {"status": "ready"}
