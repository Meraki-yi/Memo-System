"""
路由模块

包含所有的路由处理器
"""

from .auth import router as auth_router
from .reflections import router as reflections_router
from .memos import router as memos_router
from .accounting import router as accounting_router
from .pages import router as pages_router

__all__ = [
    "auth_router",
    "reflections_router",
    "memos_router",
    "accounting_router",
    "pages_router",
]
