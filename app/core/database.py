"""
数据库配置模块

提供数据库连接、会话管理和基础配置
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from config import settings


# 数据库引擎
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600
)

# 会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 声明基类
Base = declarative_base()


def get_db():
    """
    数据库会话依赖

    用于 FastAPI 依赖注入，提供数据库会话
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    初始化数据库

    创建所有数据表
    """
    # 导入所有模型以确保它们被注册到 Base
    from app.models import Reflection, Memo, Category, SubCategory, DailyRecord, RecordTemplate
    Base.metadata.create_all(bind=engine)
