"""
认证路由模块

处理用户登录、登出等认证相关操作
"""

from fastapi import APIRouter, HTTPException, status, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from app.schemas import LoginRequest
from app.core.security import check_auth
from config import settings


router = APIRouter(tags=["认证"])

# 模板配置
templates = Jinja2Templates(directory=settings.TEMPLATES_DIR)

# 密码配置
ACCESS_PASSWORD = settings.ACCESS_PASSWORD


@router.get("/", response_class=HTMLResponse)
async def read_login(request: Request):
    """登录页面"""
    return templates.TemplateResponse("login.html", {"request": request})


@router.post("/api/login")
async def login(request: Request, login_data: LoginRequest):
    """
    登录验证

    验证用户密码并设置会话
    """
    if login_data.password == ACCESS_PASSWORD:
        # 设置session，标记为已认证
        request.session["authenticated"] = True
        return {"success": True, "message": "登录成功"}
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="密码错误"
        )


@router.post("/api/logout")
async def logout(request: Request):
    """
    登出

    清除用户会话
    """
    request.session.clear()
    return {"success": True, "message": "已登出"}
