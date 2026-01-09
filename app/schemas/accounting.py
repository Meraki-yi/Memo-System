"""
记账功能相关的数据模式
"""

from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal


class CategoryCreate(BaseModel):
    """创建一级类目"""
    name: str
    record_type: str  # 'income' 或 'expense'
    icon: str = '📁'


class SubCategoryCreate(BaseModel):
    """创建二级类目"""
    category_id: int
    name: str


class CategoryUpdate(BaseModel):
    """更新一级类目"""
    name: str


class SubCategoryUpdate(BaseModel):
    """更新二级类目"""
    name: str


class DailyRecordCreate(BaseModel):
    """创建记账记录"""
    record_type: str  # 'income' 或 'expense'
    category_id: int
    subcategory_id: int
    amount: Decimal  # 使用 Decimal 确保精度
    record_date: str  # YYYY-MM-DD格式
    note: Optional[str] = None


class DailyRecordUpdate(BaseModel):
    """更新记账记录"""
    amount: Optional[Decimal] = None
    record_date: Optional[str] = None
    note: Optional[str] = None


class TemplateCreate(BaseModel):
    """创建记账模板"""
    name: str
    record_type: str
    category_id: int
    subcategory_id: int
    amount: Decimal  # 使用 Decimal 确保精度
    note: Optional[str] = None
