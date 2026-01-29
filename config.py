import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置类"""

    # 应用基本配置
    APP_NAME: str = "Memo System"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    APP_PORT: int = 7361

    # 安全配置
    ACCESS_PASSWORD: str = ""

    # 数据库配置
    MYSQL_HOST: str = "localhost"
    MYSQL_ROOT_PASSWORD: str = ""
    MYSQL_DATABASE: str = "memo_system"
    MYSQL_USER: str = ""
    MYSQL_PASSWORD: str = ""
    MYSQL_PORT: int = 3306

    @property
    def DATABASE_URL(self) -> str:
        """动态构建数据库连接字符串"""
        return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"

    # CORS配置
    ALLOWED_ORIGINS: list = ["*"]
    ALLOWED_METHODS: list = ["*"]
    ALLOWED_HEADERS: list = ["*"]

    @property
    def STATIC_DIR(self) -> str:
        """静态文件目录（支持本地和Docker环境）"""
        # 如果设置了环境变量，使用环境变量
        if os.environ.get("STATIC_DIR"):
            return os.environ.get("STATIC_DIR")
        # 否则使用相对路径
        return "frontend/static"

    @property
    def TEMPLATES_DIR(self) -> str:
        """模板文件目录（支持本地和Docker环境）"""
        # 如果设置了环境变量，使用环境变量
        if os.environ.get("TEMPLATES_DIR"):
            return os.environ.get("TEMPLATES_DIR")
        # 否则使用相对路径
        return "frontend/templates"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

# 创建全局配置实例
settings = Settings()