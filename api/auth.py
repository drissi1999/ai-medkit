# app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from uuid import UUID, uuid5, NAMESPACE_URL
from app.core.security import create_access_token, hash_password, verify_password
# from app.models import User  # TODO: integrate your ORM model

router = APIRouter()

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

def _deterministic_uuid_for_username(username: str) -> UUID:
    # Dev-friendly: stable UUID for same username; replace with DB lookup later.
    return uuid5(NAMESPACE_URL, f"https://ai-medkit.local/user/{username}")

@router.post("/token", response_model=TokenResponse, tags=["auth"])
async def login(form: OAuth2PasswordRequestForm = Depends()):
    """
    Dev login:
      - Accepts any username with password 'dev' (for now).
      - Returns a signed JWT containing `sub` (UUID), `email`, and `role`.
    TODO: Replace with DB lookup + bcrypt verification.
    """
    if form.password != "dev":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    user_id = str(_deterministic_uuid_for_username(form.username))
    token = create_access_token({"sub": user_id, "email": f"{form.username}@example.local", "role": "doctor"})
    return TokenResponse(access_token=token)

@router.get("/me")
async def me(token: TokenResponse = Depends()):
    return {"status": "ok"}  # placeholder; you'll likely return CurrentUser
