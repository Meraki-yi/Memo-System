"""
待完成数据模型
"""

from sqlalchemy import Column, Integer, Text, Boolean, DateTime, Date, Index
from datetime import datetime, date
from zoneinfo import ZoneInfo

from app.core.database import Base

# 本地时区配置
LOCAL_TZ = ZoneInfo("Asia/Shanghai")


class Memo(Base):
    """待完成表

    严格按创建日期隔离的待完成事项管理：
    - created_date: 创建日期（事项归属日期，不可更改）
    - is_completed: 是否已完成
    每个事项仅在其创建日期的页面中展示，不跨日期聚合
    """
    __tablename__ = "memos"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    is_completed = Column(Boolean, default=False)
    # 创建日期：事项归属的唯一日期，创建后不可更改
    created_date = Column(Date, nullable=False, index=True, default=lambda: date.today())
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(LOCAL_TZ))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(LOCAL_TZ), onupdate=lambda: datetime.now(LOCAL_TZ))

    # 添加索引以优化查询性能
    __table_args__ = (
        Index('idx_created_date', 'created_date'),
    )
