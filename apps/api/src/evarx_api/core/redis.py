from redis.asyncio import Redis

from evarx_api.settings import get_settings

_settings = get_settings()
redis_client: Redis = Redis.from_url(_settings.redis_url, decode_responses=True)


async def get_redis() -> Redis:
    return redis_client
