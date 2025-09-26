from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # --- Application Settings ---
    OPENWEATHERMAP_API_KEY: str

    # --- Redis Cache Settings ---
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    CACHE_TTL: int = 900  # Cache expiry time in seconds (15 minutes)

    class Config:
        # This tells pydantic-settings to look for a .env file in the root of the project
        env_file = ".env"
        env_file_encoding = 'utf-8'

# Create a single instance of the settings to be used throughout the application
settings = Settings()