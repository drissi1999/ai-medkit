import time, uuid, ipaddress, asyncio
from typing import Callable
from starlette.types import ASGIApp, Receive, Scope, Send
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from redis.asyncio import from_url as redis_from_url
from app.config import settings

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        resp = await call_next(request)
        resp.headers.update({
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "Referrer-Policy": "no-referrer",
            "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
            "Content-Security-Policy": "default-src 'self' 'unsafe-inline' data: blob:"
        })
        return resp

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        rid = str(uuid.uuid4())
        request.state.request_id = rid
        start = time.perf_counter()
        resp = await call_next(request)
        dur_ms = (time.perf_counter() - start) * 1000
        resp.headers["X-Request-ID"] = rid
        resp.headers["Server-Timing"] = f"total;dur={dur_ms:.1f}"
        return resp

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple fixed-window per-IP rate limit using Redis (1-minute window).
    """
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.redis = redis_from_url(settings.REDIS_URL)
        self.limit = settings.RATE_LIMIT_REQUESTS_PER_MINUTE

    async def dispatch(self, request, call_next: Callable):
        try:
            ip = request.client.host or "0.0.0.0"
            # normalize IP
            ipaddress.ip_address(ip)
            key = f"rl:{ip}"
            cur = await self.redis.incr(key)
            if cur == 1:
                await self.redis.expire(key, 60)
            if cur > self.limit:
                return JSONResponse({"detail": "Rate limit exceeded"}, status_code=429)
        except Exception:
            # fail-open on Redis errors
            pass
        return await call_next(request)
