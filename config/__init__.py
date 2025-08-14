from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl
from typing import List
import os

class Settings(BaseSettings):
    # Core
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # CORS / Hosts (comma-separated in .env.ini)
    CORS_ORIGINS: List[AnyHttpUrl] | List[str] = ["http://localhost:5173", "http://localhost:3000"]
    ALLOWED_HOSTS: List[str] = ["*"]

    # DB
    DATABASE_URL: str = "postgresql+asyncpg://postgres:dev_password@localhost:5432/ai_medkit"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Rate limits
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 100

    model_config = SettingsConfigDict(
        env_file=os.getenv("ENV_FILE", ".env")  # you can point this to .env.ini
        , env_file_encoding="utf-8", extra="ignore"
    )

    # Allow comma-separated lists in .env.ini
    @staticmethod
    def _split_csv(val: str | None) -> list[str]:
        return [x.strip() for x in (val or "").split(",") if x.strip()]

    def __init__(self, **values):
        super().__init__(**values)
        if isinstance(self.CORS_ORIGINS, str):
            self.CORS_ORIGINS = self._split_csv(self.CORS_ORIGINS)
        if isinstance(self.ALLOWED_HOSTS, str):
            self.ALLOWED_HOSTS = self._split_csv(self.ALLOWED_HOSTS)

settings = Settings()
