"""
Memo System - 主应用入口

这是一个集成了备忘录、复盘反思和记账功能的应用系统。
主文件仅包含应用初始化和主流程控制逻辑。
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from config import settings
from app.core import init_db
from app.routers import (
    auth_router,
    reflections_router,
    memos_router,
    accounting_router,
    pages_router
)


# ==================== 生命周期管理 ====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    init_db()
    print(f"{settings.APP_NAME} v{settings.VERSION} 启动成功！")
    yield
    # 关闭时执行（如需要可添加清理代码）
    print(f"{settings.APP_NAME} 已关闭")


# ==================== 应用初始化 ====================

# 创建 FastAPI 应用实例
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan
)

# 设置会话过期时间为7天（以秒为单位）
MAX_AGE = 7 * 24 * 60 * 60  # 7天

# 添加Session中间件
app.add_middleware(
    SessionMiddleware,
    secret_key="session-secret-key",
    max_age=MAX_AGE,
    https_only=False  # 本地开发环境，不需要HTTPS
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=settings.ALLOWED_METHODS,
    allow_headers=settings.ALLOWED_HEADERS,
)

# ==================== 挂载静态文件 ====================

app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

# ==================== 注册路由 ====================

# 认证路由（包含登录页面和API）
app.include_router(auth_router)

# 复盘反思路由
app.include_router(reflections_router)

# 备忘录路由
app.include_router(memos_router)

# 记账功能路由
app.include_router(accounting_router)

# 页面路由
app.include_router(pages_router)

# ==================== 应用入口 ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
