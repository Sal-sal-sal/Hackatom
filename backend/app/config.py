from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./npp.db"
    debug: bool = True

    hh_user_agent: str = "NPP-Hackatom/1.0 (ccgtru@gmail.com)"
    hh_default_area: int = 0
    hh_client_id: str = ""
    hh_client_secret: str = ""


settings = Settings()
