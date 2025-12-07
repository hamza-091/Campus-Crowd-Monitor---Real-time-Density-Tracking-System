from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/campusdb"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"
    
    class Config:
        env_file = ".env"

settings = Settings()
