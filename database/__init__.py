from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from app.config import settings

engine: AsyncEngine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def get_db(user_id: Optional[str] = None) -> AsyncGenerator[AsyncSession, None]:
    """
    Yields an AsyncSession and sets per-transaction GUC + ROLE for RLS.
    Call as: async with get_db(current_user_id) as session: ...
    In FastAPI, inject via dependencies and pass user_id when authenticated.
    """
    async with SessionLocal() as session:
        # Bind session to current user for RLS policies:
        #   USING (doctor_id = current_setting('app.current_user_id')::uuid)
        if user_id:
            await session.execute(text("SET LOCAL app.current_user_id = :uid"), {"uid": user_id})
            # Adopt role required by your RLS policies
            await session.execute(text("SET LOCAL ROLE authenticated_users"))
        yield session

async def create_tables():
    """
    No-op placeholder: your schema is managed via SQL files / migrations.
    """
    return

async def check_database_connection() -> bool:
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
