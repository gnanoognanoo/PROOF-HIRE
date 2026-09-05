import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = "gemini-1.5-pro-latest"
    
    # Supabase / DB
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
    
    # GitHub
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "")
    
    # Polygon
    POLYGON_RPC_URL: str = os.getenv("POLYGON_RPC_URL", "https://rpc-amoy.polygon.technology")
    PROOF_REGISTRY_ADDRESS: str = os.getenv("NEXT_PUBLIC_PROOF_REGISTRY_ADDRESS", "0x892aF7B6E67a84e313B11D445218d6e3c041B320")

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = "../../.env"
        extra = "ignore"

settings = Settings()
