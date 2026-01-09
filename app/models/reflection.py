"""
复盘反思数据模型
"""

from sqlalchemy import Column, Integer, Text, Boolean, DateTime
from datetime import datetime
from zoneinfo import ZoneInfo

from app.core.database import Base

# 本地时区配置
LOCAL_TZ = ZoneInfo("Asia/Shanghai")


class Reflection(Base):
    """复盘反思表"""
    __tablename__ = "reflections"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    is_frequent = Column(Boolean, default=False)  # 是否标记为常用（收藏）
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(LOCAL_TZ))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(LOCAL_TZ), onupdate=lambda: datetime.now(LOCAL_TZ))
