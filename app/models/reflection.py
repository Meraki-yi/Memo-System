"""
记事数据模型
"""

from sqlalchemy import Column, Integer, Text, Boolean, DateTime, String
from datetime import datetime
from zoneinfo import ZoneInfo

from app.core.database import Base

# 本地时区配置
LOCAL_TZ = ZoneInfo("Asia/Shanghai")


class Reflection(Base):
    """记事表"""
    __tablename__ = "reflections"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    is_frequent = Column(Boolean, default=False)  # 是否标记为反思收藏
    is_common_frequent = Column(Boolean, default=False)  # 是否标记为常用收藏
    content_align = Column(String(10), default='center')  # 内容对齐方式: 'left' 或 'center'
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(LOCAL_TZ))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(LOCAL_TZ), onupdate=lambda: datetime.now(LOCAL_TZ))
