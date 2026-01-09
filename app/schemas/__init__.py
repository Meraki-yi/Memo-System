"""
数据模式模块

包含所有的 Pydantic 模型定义，用于请求验证和响应序列化
"""

from .auth import LoginRequest
from .reflection import ReflectionCreate, ReflectionUpdate
from .memo import MemoCreate, MemoUpdate
from .accounting import (
    CategoryCreate,
    SubCategoryCreate,
    CategoryUpdate,
    SubCategoryUpdate,
    DailyRecordCreate,
    DailyRecordUpdate,
    TemplateCreate
)

__all__ = [
    "LoginRequest",
    "ReflectionCreate",
    "ReflectionUpdate",
    "MemoCreate",
    "MemoUpdate",
    "CategoryCreate",
    "SubCategoryCreate",
    "CategoryUpdate",
    "SubCategoryUpdate",
    "DailyRecordCreate",
    "DailyRecordUpdate",
    "TemplateCreate",
]
