"""
待完成相关的数据模式
"""

from pydantic import BaseModel
from typing import Optional
from datetime import date


class MemoCreate(BaseModel):
    """创建待完成"""
    content: str
    is_completed: Optional[bool] = False
    is_frequent: Optional[bool] = False
    created_date: Optional[date] = None  # 可选，不提供则使用今天


class MemoUpdate(BaseModel):
    """更新待完成"""
    content: Optional[str] = None
    is_completed: Optional[bool] = None
    is_frequent: Optional[bool] = None
    # 注意：created_date 不允许修改，事项归属日期在创建时确定后不可变更
