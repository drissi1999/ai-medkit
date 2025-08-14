from redis.asyncio import from_url as redis_from_url
from app.config import settings

async def check_redis_connection() -> bool:
    try:
        r = redis_from_url(settings.REDIS_URL)
        pong = await r.ping()
        return bool(pong)
    except Exception:
        return False
