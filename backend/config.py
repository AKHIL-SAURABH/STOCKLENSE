from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    alpha_vantage_api_key: str
    cache_ttl_daily: int = 86400
    cache_ttl_quote: int = 3600
    daily_request_limit: int = 25
    daily_request_hard_stop: int = 24
    environment: str = "development"
    allowed_origins: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
