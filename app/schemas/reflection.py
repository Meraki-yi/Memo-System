"""
记事相关的数据模式
"""

from pydantic import BaseModel, Field
from typing import Optional


class ReflectionCreate(BaseModel):
    """创建记事"""
    content: str
    is_frequent: Optional[bool] = False


class ReflectionUpdate(BaseModel):
    """更新记事"""
    content: Optional[str] = None
    is_frequent: Optional[bool] = None

    class Config:
        # 允许所有字段都是可选的
        extra = 'ignore'
