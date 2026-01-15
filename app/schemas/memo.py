"""
待完成相关的数据模式
"""

from pydantic import BaseModel
from typing import Optional


class MemoCreate(BaseModel):
    """创建待完成"""
    content: str
    is_completed: Optional[bool] = False
    is_frequent: Optional[bool] = False


class MemoUpdate(BaseModel):
    """更新待完成"""
    content: Optional[str] = None
    is_completed: Optional[bool] = None
    is_frequent: Optional[bool] = None
