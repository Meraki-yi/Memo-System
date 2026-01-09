"""
安全认证模块

提供用户认证和授权相关功能
"""

from fastapi import HTTPException, Request, status


def check_auth(request: Request):
    """
    检查是否已认证

    Args:
        request: FastAPI 请求对象

    Returns:
        None: 如果已认证

    Raises:
        HTTPException: 如果未认证
    """
    if not request.session.get("authenticated"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未认证，请先登录"
        )
    return None  # 返回 None 以满足 Depends
