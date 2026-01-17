"""
页面路由模块

处理应用中的所有页面路由
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from app.core.security import check_auth
from config import settings


router = APIRouter(tags=["页面"])

# 模板配置
templates = Jinja2Templates(directory=settings.TEMPLATES_DIR)


@router.get("/app", response_class=HTMLResponse)
async def read_app(request: Request):
    """主应用页面"""
    check_auth(request)
    return templates.TemplateResponse("index.html", {"request": request})


@router.get("/frequents", response_class=HTMLResponse)
async def read_frequents(request: Request):
    """常用待完成页面"""
    check_auth(request)
    return templates.TemplateResponse("frequents.html", {"request": request})


@router.get("/reflection-frequents", response_class=HTMLResponse)
async def read_reflection_frequents(request: Request):
    """常用记事页面"""
    check_auth(request)
    return templates.TemplateResponse("reflection_frequents.html", {"request": request})


@router.get("/common-frequents", response_class=HTMLResponse)
async def read_common_frequents(request: Request):
    """常用收藏页面"""
    check_auth(request)
    return templates.TemplateResponse("common_frequents.html", {"request": request})


@router.get("/accounting", response_class=HTMLResponse)
async def read_accounting(request: Request):
    """记账页面"""
    check_auth(request)
    return templates.TemplateResponse("accounting.html", {"request": request})


@router.get("/category-stats", response_class=HTMLResponse)
async def read_category_stats(request: Request):
    """分类支出统计页面"""
    check_auth(request)
    return templates.TemplateResponse("category_stats.html", {"request": request})


@router.get("/category-detail", response_class=HTMLResponse)
async def read_category_detail(request: Request):
    """分类支出详情页面"""
    check_auth(request)
    return templates.TemplateResponse("category_detail.html", {"request": request})


@router.get("/income-stats", response_class=HTMLResponse)
async def read_income_stats(request: Request):
    """分类收入统计页面"""
    check_auth(request)
    return templates.TemplateResponse("income_stats.html", {"request": request})


@router.get("/income-detail", response_class=HTMLResponse)
async def read_income_detail(request: Request):
    """分类收入详情页面"""
    check_auth(request)
    return templates.TemplateResponse("income_detail.html", {"request": request})


@router.get("/yearly-overview", response_class=HTMLResponse)
async def read_yearly_overview(request: Request):
    """年度概览页面"""
    check_auth(request)
    return templates.TemplateResponse("yearly_overview.html", {"request": request})
