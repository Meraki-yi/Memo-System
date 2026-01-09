"""
认证相关的数据模式
"""

from pydantic import BaseModel


class LoginRequest(BaseModel):
    """登录请求"""
    password: str
