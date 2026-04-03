from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    upload_dir: str = "uploads"
    max_file_size_mb: int = 50

    class Config:
        env_file = ".env"


settings = Settings()
