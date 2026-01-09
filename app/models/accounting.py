"""
记账功能数据模型

包含记账相关的所有数据表：
- Category: 一级类目表
- SubCategory: 二级类目表
- DailyRecord: 每日记账记录表
- RecordTemplate: 记账模板表
"""

from sqlalchemy import Column, Integer, String, Text, Date, Numeric, DateTime
from datetime import datetime
from zoneinfo import ZoneInfo

from app.core.database import Base

# 本地时区配置
LOCAL_TZ = ZoneInfo("Asia/Shanghai")


class Category(Base):
    """一级类目表"""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    record_type = Column(String(10), nullable=False)  # 'income' 或 'expense'
    icon = Column(String(50), default='📁')  # 类目图标
    sort_order = Column(Integer, default=0)  # 排序
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(LOCAL_TZ))


class SubCategory(Base):
    """二级类目表"""
    __tablename__ = "subcategories"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, nullable=False)
    name = Column(String(50), nullable=False)
    sort_order = Column(Integer, default=0)  # 排序
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(LOCAL_TZ))


class DailyRecord(Base):
    """每日记账记录表"""
    __tablename__ = "daily_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)  # 用户ID，默认为1
    record_type = Column(String(10), nullable=False)  # 'income' 或 'expense'
    category_id = Column(Integer, nullable=False)
    subcategory_id = Column(Integer, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)  # 金额：保留两位小数
    record_date = Column(Date, nullable=False)  # 记账日期
    note = Column(Text, nullable=True)  # 备注
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(LOCAL_TZ))


class RecordTemplate(Base):
    """记账模板表"""
    __tablename__ = "record_templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)  # 用户ID
    record_type = Column(String(10), nullable=False)  # 'income' 或 'expense'
    category_id = Column(Integer, nullable=False)
    subcategory_id = Column(Integer, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)  # 金额：保留两位小数
    note = Column(Text, nullable=True)
    name = Column(String(100), nullable=False)  # 模板名称
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(LOCAL_TZ))
