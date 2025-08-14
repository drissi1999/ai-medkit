# app/deps/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
from app.core.security import decode_token
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

# Matches your router prefix: /api/v1/auth/token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

class CurrentUser(BaseModel):
    id: str
    email: Optional[str] = None
    role: Optional[str] = "doctor"

async def get_current_user(token: str = Depends(oauth2_scheme)) -> CurrentUser:
    try:
        payload = decode_token(token)
        uid = str(payload.get("sub") or payload.get("user_id"))
        if not uid:
            raise ValueError("Missing sub")
        return CurrentUser(id=uid, email=payload.get("email"), role=payload.get("role", "doctor"))
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def get_db_session(user: CurrentUser = Depends(get_current_user)) -> AsyncSession:
    # Injects user.id into Postgres session for RLS: SET LOCAL app.current_user_id + ROLE
    async for sess in get_db(user_id=user.id):
        yield sess
