from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置类"""

    # 应用基本配置
    APP_NAME: str = "Memo System"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # 安全配置
    ACCESS_PASSWORD: str = ""  # 访问密码，从.env读取

    # 数据库配置
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/memo_system"

    # CORS配置
    ALLOWED_ORIGINS: list = ["*"]
    ALLOWED_METHODS: list = ["*"]
    ALLOWED_HEADERS: list = ["*"]

    # 文件路径配置
    STATIC_DIR: str = "frontend/static"
    TEMPLATES_DIR: str = "frontend/templates"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

# 创建全局配置实例
settings = Settings()