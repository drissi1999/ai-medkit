# app/main.py
"""
AI MedKit - FastAPI Backend Application
Production-ready medical AI assistant API
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import time
import logging

from app.config import settings
from app.database import engine, create_tables
from app.core.middleware import (
    SecurityHeadersMiddleware,
    LoggingMiddleware,
    RateLimitMiddleware
)
from app.core.exceptions import APIException, api_exception_handler
from app.api import auth, chat, medical, patients, calendar, websocket


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("🚀 Starting AI MedKit API...")
    
    # Create database tables
    await create_tables()
    
    # Initialize AI models
    from app.ai.llm_client import initialize_llm_models
    await initialize_llm_models()
    
    # Initialize vector store
    from app.ai.vector_store import initialize_vector_store
    await initialize_vector_store()
    
    logger.info("✅ AI MedKit API started successfully")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down AI MedKit API...")
    
    # Cleanup resources
    await engine.dispose()
    
    logger.info("✅ AI MedKit API shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="AI MedKit API",
    description="AI-powered medical assistant for healthcare professionals",
    version="0.1.0",
    docs_url="/api/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/api/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan,
    openapi_tags=[
        {
            "name": "auth",
            "description": "Authentication and user management"
        },
        {
            "name": "chat",
            "description": "AI chat interface and medical conversations"
        },
        {
            "name": "medical",
            "description": "Medical analysis, lab results, and imaging"
        },
        {
            "name": "patients",
            "description": "Patient management and medical records"
        },
        {
            "name": "calendar",
            "description": "Appointment scheduling and calendar integration"
        }
    ]
)

# Security Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

app.add_middleware(SecurityHeadersMiddleware)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-RateLimit-Remaining"]
)

# Custom Middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)


# Exception Handlers
app.add_exception_handler(APIException, api_exception_handler)


@app.exception_handler(500)
async def internal_server_error_handler(request: Request, exc: Exception):
    """Handle internal server errors"""
    logger.error(f"Internal server error: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again later.",
            "request_id": getattr(request.state, "request_id", None)
        }
    )


# Health Check Endpoints
@app.get("/health", tags=["system"])
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "0.1.0",
        "environment": settings.ENVIRONMENT
    }


@app.get("/health/detailed", tags=["system"])
async def detailed_health_check():
    """Detailed health check with dependencies"""
    from app.database import check_database_connection
    from app.services.medical_ai_service import check_ai_models
    
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "checks": {}
    }
    
    # Check database connection
    try:
        db_healthy = await check_database_connection()
        health_status["checks"]["database"] = {
            "status": "healthy" if db_healthy else "unhealthy",
            "response_time_ms": None  # TODO: Add timing
        }
    except Exception as e:
        health_status["checks"]["database"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "degraded"
    
    # Check AI models
    try:
        ai_healthy = await check_ai_models()
        health_status["checks"]["ai_models"] = {
            "status": "healthy" if ai_healthy else "unhealthy"
        }
    except Exception as e:
        health_status["checks"]["ai_models"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "degraded"
    
    # Check Redis connection
    try:
        from app.services.auth_service import check_redis_connection
        redis_healthy = await check_redis_connection()
        health_status["checks"]["redis"] = {
            "status": "healthy" if redis_healthy else "unhealthy"
        }
    except Exception as e:
        health_status["checks"]["redis"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "degraded"
    
    return health_status


# API Routers
app.include_router(
    auth.router,
    prefix="/api/v1/auth",
    tags=["auth"]
)

app.include_router(
    chat.router,
    prefix="/api/v1/chat",
    tags=["chat"]
)

app.include_router(
    medical.router,
    prefix="/api/v1/medical",
    tags=["medical"]
)

app.include_router(
    patients.router,
    prefix="/api/v1/patients",
    tags=["patients"]
)

app.include_router(
    calendar.router,
    prefix="/api/v1/calendar",
    tags=["calendar"]
)

app.include_router(
    websocket.router,
    prefix="/api/v1/ws",
    tags=["websocket"]
)


# Root endpoint
@app.get("/", tags=["system"])
async def root():
    """API root endpoint"""
    return {
        "message": "AI MedKit API",
        "version": "0.1.0",
        "docs_url": "/api/docs" if settings.ENVIRONMENT != "production" else None,
        "health_check": "/health"
    }


# Metrics endpoint for monitoring
@app.get("/metrics", tags=["system"])
async def metrics():
    """Prometheus metrics endpoint"""
    # TODO: Implement proper Prometheus metrics
    return {
        "active_sessions": 0,  # Get from Redis
        "total_requests": 0,   # Get from middleware counter
        "ai_requests_today": 0,
        "average_response_time": 0
    }


if __name__ == "__main__":
    # For development only
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",
        log_level="info"
    )