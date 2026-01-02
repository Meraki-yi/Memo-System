from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, Response
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal
from zoneinfo import ZoneInfo
import csv
import json
from io import StringIO

# 本地时区配置（根据需要修改）
LOCAL_TZ = ZoneInfo("Asia/Shanghai")  # 中国时区，如需其他时区请修改
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, Date, Numeric, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# 导入配置
from config import settings

# 应用配置
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG
)

# 添加Session中间件
from starlette.middleware.sessions import SessionMiddleware
# 设置会话过期时间为7天（以秒为单位）
MAX_AGE = 7 * 24 * 60 * 60  # 7天
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

# 挂载静态文件
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

# 模板配置
templates = Jinja2Templates(directory=settings.TEMPLATES_DIR)

# 密码配置
ACCESS_PASSWORD = settings.ACCESS_PASSWORD

# 数据库配置
DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# 数据库模型
class Reflection(Base):
    __tablename__ = "reflections"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(LOCAL_TZ))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(LOCAL_TZ), onupdate=lambda: datetime.now(LOCAL_TZ))

class Memo(Base):
    __tablename__ = "memos"

    id = Column(Integer, primary_key=True,index=True)
    content = Column(Text, nullable=False)
    is_completed = Column(Boolean, default=False)
    is_frequent = Column(Boolean, default=False)  # 是否标记为常用
    images = Column(JSON, nullable=True)  # 存储图片base64数组
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(LOCAL_TZ))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(LOCAL_TZ), onupdate=lambda: datetime.now(LOCAL_TZ))

# 记账功能数据模型
class Category(Base):
    """一级类目表"""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    record_type = Column(String(10), nullable=False)  # 'income' 或 'expense'
    icon = Column(String(50), default='📁')  # 类目图标
    sort_order = Column(Integer, default=0)  # 排序
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(LOCAL_TZ))

class SubCategory(Base):
    """二级类目表"""
    __tablename__ = "subcategories"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, nullable=False)
    name = Column(String(50), nullable=False)
    sort_order = Column(Integer, default=0)  # 排序
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(LOCAL_TZ))

class DailyRecord(Base):
    """每日记账记录表"""
    __tablename__ = "daily_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)  # 用户ID，默认为1
    record_type = Column(String(10), nullable=False)  # 'income' 或 'expense'
    category_id = Column(Integer, nullable=False)  # 移除外键约束
    subcategory_id = Column(Integer, nullable=False)  # 移除外键约束
    amount = Column(Numeric(10, 2), nullable=False)  # 金额：保留两位小数
    record_date = Column(Date, nullable=False)  # 记账日期
    note = Column(Text, nullable=True)  # 备注
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(LOCAL_TZ))

class RecordTemplate(Base):
    """记账模板表"""
    __tablename__ = "record_templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)  # 用户ID
    record_type = Column(String(10), nullable=False)  # 'income' 或 'expense'
    category_id = Column(Integer, nullable=False)  # 移除外键约束
    subcategory_id = Column(Integer, nullable=False)  # 移除外键约束
    amount = Column(Numeric(10, 2), nullable=False)  # 金额：保留两位小数
    note = Column(Text, nullable=True)
    name = Column(String(100), nullable=False)  # 模板名称
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(LOCAL_TZ))

# 创建数据库表
Base.metadata.create_all(bind=engine)


# 辅助函数：格式化金额为两位小数的字符串
def format_amount(amount) -> str:
    """将金额格式化为保留两位小数的字符串"""
    if amount is None:
        return "0.00"
    return f"{float(amount):.2f}"


# 辅助函数：格式化金额为浮点数（保留两位小数精度）
def format_amount_float(amount) -> float:
    """将金额格式化为保留两位小数的浮点数"""
    if amount is None:
        return 0.0
    return round(float(amount), 2)

# 数据库依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic模型
class LoginRequest(BaseModel):
    password: str

class ReflectionCreate(BaseModel):
    content: str

class ReflectionUpdate(BaseModel):
    content: Optional[str] = None

class MemoCreate(BaseModel):
    content: str
    is_frequent: Optional[bool] = False
    images: Optional[list] = None  # 图片base64数组

class MemoUpdate(BaseModel):
    content: Optional[str] = None
    is_completed: Optional[bool] = None
    is_frequent: Optional[bool] = None
    images: Optional[list] = None  # 图片base64数组

# 记账功能 Pydantic 模型
class CategoryCreate(BaseModel):
    name: str
    record_type: str  # 'income' 或 'expense'
    icon: str = '📁'

class SubCategoryCreate(BaseModel):
    category_id: int
    name: str

class CategoryUpdate(BaseModel):
    name: str

class SubCategoryUpdate(BaseModel):
    name: str

class DailyRecordCreate(BaseModel):
    record_type: str  # 'income' 或 'expense'
    category_id: int
    subcategory_id: int
    amount: Decimal  # 使用 Decimal 确保精度
    record_date: str  # YYYY-MM-DD格式
    note: Optional[str] = None

class DailyRecordUpdate(BaseModel):
    amount: Optional[Decimal] = None
    record_date: Optional[str] = None
    note: Optional[str] = None

class TemplateCreate(BaseModel):
    name: str
    record_type: str
    category_id: int
    subcategory_id: int
    amount: Decimal  # 使用 Decimal 确保精度
    note: Optional[str] = None

# 路由
@app.get("/", response_class=HTMLResponse)
async def read_login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.post("/api/login")
async def login(request: Request, login_data: LoginRequest):
    """登录验证"""
    if login_data.password == ACCESS_PASSWORD:
        # 设置session，标记为已认证
        request.session["authenticated"] = True
        return {"success": True, "message": "登录成功"}
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="密码错误"
        )

@app.get("/app", response_class=HTMLResponse)
async def read_app(request: Request):
    # 检查是否已认证
    if not request.session.get("authenticated"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未认证，请先登录"
        )
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/frequents", response_class=HTMLResponse)
async def read_frequents(request: Request):
    # 检查是否已认证
    if not request.session.get("authenticated"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未认证，请先登录"
        )
    return templates.TemplateResponse("frequents.html", {"request": request})

# 验证中间件
def check_auth(request: Request):
    """检查是否已认证"""
    if not request.session.get("authenticated"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未认证，请先登录"
        )
    return None  # 返回 None 以满足 Depends

# Reflection相关API
@app.get("/api/reflections")
async def get_reflections(
    request: Request,
    page: int = 1,
    page_size: int = 5,
    db: Session = Depends(get_db)
):
    check_auth(request)
    # 计算总数
    total = db.query(Reflection).count()
    # 计算总页数
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    # 分页查询 - 按更新时间排序（修改过的排在前面）
    offset = (page - 1) * page_size
    reflections = db.query(Reflection).order_by(Reflection.updated_at.desc()).offset(offset).limit(page_size).all()
    return {
        "items": [
            {
                "id": r.id,
                "content": r.content,
                "created_at": r.created_at.isoformat(),
                "updated_at": r.updated_at.isoformat()
            }
            for r in reflections
        ],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages
        }
    }

@app.post("/api/reflections")
async def create_reflection(
    request: Request,
    reflection: ReflectionCreate,
    db: Session = Depends(get_db)
):
    check_auth(request)
    db_reflection = Reflection(content=reflection.content)
    db.add(db_reflection)
    db.commit()
    db.refresh(db_reflection)
    return {
        "id": db_reflection.id,
        "content": db_reflection.content,
        "created_at": db_reflection.created_at.isoformat(),
        "updated_at": db_reflection.updated_at.isoformat()
    }

@app.put("/api/reflections/{reflection_id}")
async def update_reflection(
    request: Request,
    reflection_id: int,
    reflection: ReflectionUpdate,
    db: Session = Depends(get_db)
):
    check_auth(request)
    db_reflection = db.query(Reflection).filter(Reflection.id == reflection_id).first()
    if not db_reflection:
        raise HTTPException(status_code=404, detail="Reflection not found")

    if reflection.content is not None:
        db_reflection.content = reflection.content

    db_reflection.updated_at = datetime.now(LOCAL_TZ)
    db.commit()
    db.refresh(db_reflection)
    return {
        "id": db_reflection.id,
        "content": db_reflection.content,
        "created_at": db_reflection.created_at.isoformat(),
        "updated_at": db_reflection.updated_at.isoformat()
    }

@app.delete("/api/reflections/{reflection_id}")
async def delete_reflection(
    request: Request,
    reflection_id: int,
    db: Session = Depends(get_db)
):
    check_auth(request)
    db_reflection = db.query(Reflection).filter(Reflection.id == reflection_id).first()
    if not db_reflection:
        raise HTTPException(status_code=404, detail="Reflection not found")

    db.delete(db_reflection)
    db.commit()
    return {"message": "Reflection deleted successfully"}

# Memo相关API
@app.get("/api/memos")
async def get_memos(
    request: Request,
    page: int = 1,
    page_size: int = 5,
    db: Session = Depends(get_db)
):
    check_auth(request)
    # 计算总数
    total = db.query(Memo).count()
    # 计算总页数
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    # 分页查询 - 使用子查询避免对大JSON字段排序
    # 按更新时间排序（修改过的排在前面）
    offset = (page - 1) * page_size
    # 先获取排序后的ID列表
    memo_ids_query = db.query(Memo.id).order_by(Memo.updated_at.desc()).offset(offset).limit(page_size)
    memo_ids = [id[0] for id in memo_ids_query.all()]
    # 再根据ID列表获取完整数据
    if memo_ids:
        memos = db.query(Memo).filter(Memo.id.in_(memo_ids)).all()
        # 按原始ID顺序排序
        memos_dict = {m.id: m for m in memos}
        memos = [memos_dict[id] for id in memo_ids]
    else:
        memos = []
    return {
        "items": [
            {
                "id": m.id,
                "content": m.content,
                "is_completed": m.is_completed,
                "is_frequent": m.is_frequent,
                "images": m.images if m.images else [],
                "created_at": m.created_at.isoformat(),
                "updated_at": m.updated_at.isoformat()
            }
            for m in memos
        ],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages
        }
    }

@app.post("/api/memos")
async def create_memo(
    request: Request,
    memo: MemoCreate,
    db: Session = Depends(get_db)
):
    check_auth(request)
    db_memo = Memo(
        content=memo.content,
        is_completed=memo.is_completed if hasattr(memo, 'is_completed') else False,
        is_frequent=memo.is_frequent if memo.is_frequent else False,
        images=memo.images if memo.images else []
    )
    db.add(db_memo)
    db.commit()
    db.refresh(db_memo)
    return {
        "id": db_memo.id,
        "content": db_memo.content,
        "is_completed": db_memo.is_completed,
        "is_frequent": db_memo.is_frequent,
        "images": db_memo.images if db_memo.images else [],
        "created_at": db_memo.created_at.isoformat(),
        "updated_at": db_memo.updated_at.isoformat()
    }

@app.get("/api/memos/frequents")
async def get_frequent_memos(
    request: Request,
    page: int = 1,
    page_size: int = 5,
    db: Session = Depends(get_db)
):
    """获取常用备忘录列表"""
    check_auth(request)
    # 计算常用备忘录总数
    total = db.query(Memo).filter(Memo.is_frequent == True).count()
    # 计算总页数
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    # 分页查询 - 使用子查询避免对大JSON字段排序
    # 按更新时间排序（修改过的排在前面）
    offset = (page - 1) * page_size
    # 先获取排序后的常用备忘录ID列表
    frequent_memo_ids_query = db.query(Memo.id).filter(Memo.is_frequent == True).order_by(Memo.updated_at.desc()).offset(offset).limit(page_size)
    memo_ids = [id[0] for id in frequent_memo_ids_query.all()]
    # 再根据ID列表获取完整数据
    if memo_ids:
        memos = db.query(Memo).filter(Memo.id.in_(memo_ids)).all()
        # 按原始ID顺序排序
        memos_dict = {m.id: m for m in memos}
        memos = [memos_dict[id] for id in memo_ids]
    else:
        memos = []
    return {
        "items": [
            {
                "id": m.id,
                "content": m.content,
                "is_completed": m.is_completed,
                "is_frequent": m.is_frequent,
                "images": m.images if m.images else [],
                "created_at": m.created_at.isoformat(),
                "updated_at": m.updated_at.isoformat()
            }
            for m in memos
        ],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages
        }
    }

@app.get("/api/memos/{memo_id}")
async def get_memo(
    request: Request,
    memo_id: int,
    db: Session = Depends(get_db)
):
    """获取单个备忘录"""
    check_auth(request)
    db_memo = db.query(Memo).filter(Memo.id == memo_id).first()
    if not db_memo:
        raise HTTPException(status_code=404, detail="Memo not found")

    return {
        "id": db_memo.id,
        "content": db_memo.content,
        "is_completed": db_memo.is_completed,
        "is_frequent": db_memo.is_frequent,
        "images": db_memo.images if db_memo.images else [],
        "created_at": db_memo.created_at.isoformat(),
        "updated_at": db_memo.updated_at.isoformat()
    }

@app.put("/api/memos/{memo_id}")
async def update_memo(
    request: Request,
    memo_id: int,
    memo: MemoUpdate,
    db: Session = Depends(get_db)
):
    check_auth(request)
    db_memo = db.query(Memo).filter(Memo.id == memo_id).first()
    if not db_memo:
        raise HTTPException(status_code=404, detail="Memo not found")

    if memo.content is not None:
        db_memo.content = memo.content
    if memo.is_completed is not None:
        db_memo.is_completed = memo.is_completed
    if memo.is_frequent is not None:
        db_memo.is_frequent = memo.is_frequent
    if memo.images is not None:
        db_memo.images = memo.images

    db_memo.updated_at = datetime.now(LOCAL_TZ)
    db.commit()
    db.refresh(db_memo)
    return {
        "id": db_memo.id,
        "content": db_memo.content,
        "is_completed": db_memo.is_completed,
        "is_frequent": db_memo.is_frequent,
        "images": db_memo.images if db_memo.images else [],
        "created_at": db_memo.created_at.isoformat(),
        "updated_at": db_memo.updated_at.isoformat()
    }

@app.delete("/api/memos/{memo_id}")
async def delete_memo(
    request: Request,
    memo_id: int,
    db: Session = Depends(get_db)
):
    check_auth(request)
    db_memo = db.query(Memo).filter(Memo.id == memo_id).first()
    if not db_memo:
        raise HTTPException(status_code=404, detail="Memo not found")

    db.delete(db_memo)
    db.commit()
    return {"message": "Memo deleted successfully"}

# ==================== 记账功能 API ====================

# 获取所有类目（包含二级类目）
@app.get("/api/accounting/categories")
async def get_categories(request: Request, db: Session = Depends(get_db)):
    """获取所有类目，按类型分组"""
    check_auth(request)
    categories = db.query(Category).order_by(Category.record_type, Category.sort_order).all()

    # 获取所有二级类目
    all_subcategories = db.query(SubCategory).order_by(SubCategory.sort_order).all()

    result = {
        "income": [],
        "expense": []
    }

    for cat in categories:
        # 手动查询该一级类目下的二级类目
        cat_subcategories = [sub for sub in all_subcategories if sub.category_id == cat.id]
        cat_data = {
            "id": cat.id,
            "name": cat.name,
            "icon": cat.icon,
            "subcategories": [
                {"id": sub.id, "name": sub.name}
                for sub in sorted(cat_subcategories, key=lambda x: x.sort_order)
            ]
        }
        result[cat.record_type].append(cat_data)

    return result

# 创建一级类目
@app.post("/api/accounting/categories")
async def create_category(request: Request, category: CategoryCreate, db: Session = Depends(get_db)):
    check_auth(request)
    db_category = Category(
        name=category.name,
        record_type=category.record_type,
        icon=category.icon
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return {
        "id": db_category.id,
        "name": db_category.name,
        "record_type": db_category.record_type,
        "icon": db_category.icon
    }

# 创建二级类目
@app.post("/api/accounting/subcategories")
async def create_subcategory(request: Request, subcategory: SubCategoryCreate, db: Session = Depends(get_db)):
    check_auth(request)
    db_subcategory = SubCategory(
        category_id=subcategory.category_id,
        name=subcategory.name
    )
    db.add(db_subcategory)
    db.commit()
    db.refresh(db_subcategory)
    return {
        "id": db_subcategory.id,
        "category_id": db_subcategory.category_id,
        "name": db_subcategory.name
    }

# 删除二级类目（需要先删除关联的记录）
@app.delete("/api/accounting/subcategories/{subcategory_id}")
async def delete_subcategory(request: Request, subcategory_id: int, db: Session = Depends(get_db)):
    check_auth(request)
    try:
        db_subcategory = db.query(SubCategory).filter(SubCategory.id == subcategory_id).first()
        if not db_subcategory:
            raise HTTPException(status_code=404, detail="二级类目不存在")

        # 检查是否有关联的记账记录
        related_records_count = db.query(DailyRecord).filter(DailyRecord.subcategory_id == subcategory_id).count()
        if related_records_count > 0:
            raise HTTPException(
                status_code=400,
                detail=f"该二级类目下有 {related_records_count} 条记账记录，无法删除。请先删除相关记录。"
            )

        db.delete(db_subcategory)
        db.commit()
        return {"success": True, "message": "二级类目删除成功"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"删除失败: {str(e)}")

# 删除一级类目（需要先删除所有二级类目和记录）
@app.delete("/api/accounting/categories/{category_id}")
async def delete_category(request: Request, category_id: int, db: Session = Depends(get_db)):
    check_auth(request)
    try:
        db_category = db.query(Category).filter(Category.id == category_id).first()
        if not db_category:
            raise HTTPException(status_code=404, detail="一级类目不存在")

        # 手动查询该一级类目下的所有二级类目
        subcategories = db.query(SubCategory).filter(SubCategory.category_id == category_id).all()

        # 检查所有二级类目下是否有关联记录
        total_records = 0
        for subcategory in subcategories:
            record_count = db.query(DailyRecord).filter(DailyRecord.subcategory_id == subcategory.id).count()
            total_records += record_count

        if total_records > 0:
            raise HTTPException(
                status_code=400,
                detail=f"该一级类目下共有 {total_records} 条记账记录，无法删除。请先删除相关记录。"
            )

        # 先删除所有二级类目
        for subcategory in subcategories:
            db.delete(subcategory)

        # 再删除一级类目
        db.delete(db_category)
        db.commit()
        return {"success": True, "message": "一级类目删除成功"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"删除失败: {str(e)}")

# 重命名一级类目
@app.put("/api/accounting/categories/{category_id}")
async def rename_category(request: Request, category_id: int, category_data: CategoryUpdate, db: Session = Depends(get_db)):
    check_auth(request)
    try:
        db_category = db.query(Category).filter(Category.id == category_id).first()
        if not db_category:
            raise HTTPException(status_code=404, detail="一级类目不存在")

        db_category.name = category_data.name
        db.commit()
        db.refresh(db_category)
        return {
            "id": db_category.id,
            "name": db_category.name,
            "record_type": db_category.record_type,
            "icon": db_category.icon
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"重命名失败: {str(e)}")

# 重命名二级类目
@app.put("/api/accounting/subcategories/{subcategory_id}")
async def rename_subcategory(request: Request, subcategory_id: int, subcategory_data: SubCategoryUpdate, db: Session = Depends(get_db)):
    check_auth(request)
    try:
        db_subcategory = db.query(SubCategory).filter(SubCategory.id == subcategory_id).first()
        if not db_subcategory:
            raise HTTPException(status_code=404, detail="二级类目不存在")

        db_subcategory.name = subcategory_data.name
        db.commit()
        db.refresh(db_subcategory)
        return {
            "id": db_subcategory.id,
            "category_id": db_subcategory.category_id,
            "name": db_subcategory.name
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"重命名失败: {str(e)}")

# 获取记账记录
@app.get("/api/accounting/records")
async def get_records(
    request: Request,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    week_page: Optional[int] = None,
    db: Session = Depends(get_db)
):
    check_auth(request)

    # 如果使用周分页
    if week_page is not None:
        query = db.query(DailyRecord).order_by(DailyRecord.record_date.desc(), DailyRecord.created_at.desc())

        if start_date:
            query = query.filter(DailyRecord.record_date >= start_date)
        if end_date:
            query = query.filter(DailyRecord.record_date <= end_date)

        # 获取所有记录
        all_records = query.all()

        if not all_records:
            return {
                "items": [],
                "week_info": None,
                "pagination": {
                    "page": week_page,
                    "total_pages": 0,
                    "total": 0
                }
            }

        # 按日期分组
        from collections import defaultdict
        records_by_date = defaultdict(list)
        for record in all_records:
            records_by_date[record.record_date].append(record)

        # 获取所有有记录的日期，按降序排列
        all_dates = sorted(records_by_date.keys(), reverse=True)

        # 计算周分组
        weeks = []
        current_week = []

        for date in enumerate(all_dates):
            # 将日期转换为周一（周的第一天）
            from datetime import timedelta
            monday = date[1] - timedelta(days=date[1].weekday())

            if not current_week:
                current_week = [date[1]]
                current_monday = monday
            elif monday == current_monday:
                # 同一周
                current_week.append(date[1])
            else:
                # 新的一周
                weeks.append(current_week)
                current_week = [date[1]]
                current_monday = monday

        # 添加最后一周
        if current_week:
            weeks.append(current_week)

        # 计算总周数
        total_weeks = len(weeks)

        # 获取请求的周（week_page 从 1 开始）
        week_index = week_page - 1

        # 如果请求的页码超出范围，返回空数据
        # 但保留分页信息，这样前端可以正确显示按钮状态
        if week_index < 0 or week_index >= total_weeks or total_weeks == 0:
            return {
                "items": [],
                "week_info": None,
                "pagination": {
                    "page": week_page,
                    "total_pages": total_weeks,
                    "total": len(all_records)
                }
            }

        # 获取当前周的日期范围
        week_dates = weeks[week_index]
        week_start = min(week_dates)

        # 获取该周的所有记录
        week_records = []
        for date in week_dates:
            week_records.extend(records_by_date[date])

        # 按日期降序、创建时间降序排序
        week_records.sort(key=lambda x: (x.record_date, x.created_at), reverse=True)

        result = []
        for record in week_records:
            category = db.query(Category).filter(Category.id == record.category_id).first()
            subcategory = db.query(SubCategory).filter(SubCategory.id == record.subcategory_id).first()

            result.append({
                "id": record.id,
                "record_type": record.record_type,
                "category_id": record.category_id,
                "category_name": category.name if category else "",
                "category_icon": category.icon if category else "📁",
                "subcategory_id": record.subcategory_id,
                "subcategory_name": subcategory.name if subcategory else "",
                "amount": format_amount_float(record.amount),
                "record_date": record.record_date.isoformat(),
                "note": record.note,
                "created_at": record.created_at.isoformat()
            })

        # 计算该周的周一和周日
        week_monday = week_start - timedelta(days=week_start.weekday())
        week_sunday = week_monday + timedelta(days=6)

        return {
            "items": result,
            "week_info": {
                "start_date": week_monday.isoformat(),
                "end_date": week_sunday.isoformat(),
                "start_display": week_monday.strftime("%m月%d日"),
                "end_display": week_sunday.strftime("%m月%d日")
            },
            "pagination": {
                "page": week_page,
                "total_pages": total_weeks,
                "total": len(all_records)
            }
        }

    # 原有的按条数分页逻辑
    query = db.query(DailyRecord).order_by(DailyRecord.record_date.desc(), DailyRecord.created_at.desc())

    if start_date:
        query = query.filter(DailyRecord.record_date >= start_date)
    if end_date:
        query = query.filter(DailyRecord.record_date <= end_date)

    # 计算总数
    total = query.count()
    # 计算总页数
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    # 分页查询
    offset = (page - 1) * page_size
    records = query.offset(offset).limit(page_size).all()

    result = []
    for record in records:
        category = db.query(Category).filter(Category.id == record.category_id).first()
        subcategory = db.query(SubCategory).filter(SubCategory.id == record.subcategory_id).first()

        result.append({
            "id": record.id,
            "record_type": record.record_type,
            "category_id": record.category_id,
            "category_name": category.name if category else "",
            "category_icon": category.icon if category else "📁",
            "subcategory_id": record.subcategory_id,
            "subcategory_name": subcategory.name if subcategory else "",
            "amount": format_amount_float(record.amount),
            "record_date": record.record_date.isoformat(),
            "note": record.note,
            "created_at": record.created_at.isoformat()
        })

    return {
        "items": result,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages
        }
    }

# 创建记账记录
@app.post("/api/accounting/records")
async def create_record(request: Request, record: DailyRecordCreate, db: Session = Depends(get_db)):
    check_auth(request)

    # 验证类目是否存在
    category = db.query(Category).filter(Category.id == record.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="一级类目不存在")

    subcategory = db.query(SubCategory).filter(SubCategory.id == record.subcategory_id).first()
    if not subcategory:
        raise HTTPException(status_code=404, detail="二级类目不存在")

    from datetime import date
    record_date = date.fromisoformat(record.record_date)

    db_record = DailyRecord(
        record_type=record.record_type,
        category_id=record.category_id,
        subcategory_id=record.subcategory_id,
        amount=round(record.amount, 2),
        record_date=record_date,
        note=record.note
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return {
        "id": db_record.id,
        "message": "记账记录创建成功"
    }

# 获取单条记账记录
@app.get("/api/accounting/records/{record_id}")
async def get_record(request: Request, record_id: int, db: Session = Depends(get_db)):
    """获取单条记账记录的详细信息"""
    check_auth(request)
    record = db.query(DailyRecord).filter(DailyRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="记录不存在")

    category = db.query(Category).filter(Category.id == record.category_id).first()
    subcategory = db.query(SubCategory).filter(SubCategory.id == record.subcategory_id).first()

    return {
        "id": record.id,
        "record_type": record.record_type,
        "category_id": record.category_id,
        "category_name": category.name if category else "",
        "category_icon": category.icon if category else "📁",
        "subcategory_id": record.subcategory_id,
        "subcategory_name": subcategory.name if subcategory else "",
        "amount": format_amount_float(record.amount),
        "record_date": record.record_date.isoformat(),
        "note": record.note,
        "created_at": record.created_at.isoformat()
    }

# 更新记账记录
@app.put("/api/accounting/records/{record_id}")
async def update_record(request: Request, record_id: int, record: DailyRecordCreate, db: Session = Depends(get_db)):
    check_auth(request)
    db_record = db.query(DailyRecord).filter(DailyRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="记录不存在")

    # 验证类目是否存在
    category = db.query(Category).filter(Category.id == record.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="一级类目不存在")

    subcategory = db.query(SubCategory).filter(SubCategory.id == record.subcategory_id).first()
    if not subcategory:
        raise HTTPException(status_code=404, detail="二级类目不存在")

    from datetime import date
    record_date = date.fromisoformat(record.record_date)

    db_record.record_type = record.record_type
    db_record.category_id = record.category_id
    db_record.subcategory_id = record.subcategory_id
    db_record.amount = round(record.amount, 2)
    db_record.record_date = record_date
    db_record.note = record.note

    db.commit()
    return {"message": "记录更新成功"}

@app.delete("/api/accounting/records/{record_id}")
async def delete_record(request: Request, record_id: int, db: Session = Depends(get_db)):
    check_auth(request)
    db_record = db.query(DailyRecord).filter(DailyRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="记录不存在")
    db.delete(db_record)
    db.commit()
    return {"message": "记录删除成功"}

# 获取统计汇总
@app.get("/api/accounting/summary")
async def get_summary(
    request: Request,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    check_auth(request)
    query = db.query(DailyRecord)

    if start_date:
        query = query.filter(DailyRecord.record_date >= start_date)
    if end_date:
        query = query.filter(DailyRecord.record_date <= end_date)

    records = query.all()

    total_income = sum(r.amount for r in records if r.record_type == "income")
    total_expense = sum(r.amount for r in records if r.record_type == "expense")

    return {
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "net_amount": round(total_income - total_expense, 2)
    }

# 获取每日汇总
@app.get("/api/accounting/daily-summary")
async def get_daily_summary(
    request: Request,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    check_auth(request)
    query = db.query(DailyRecord).order_by(DailyRecord.record_date.desc())

    if start_date:
        query = query.filter(DailyRecord.record_date >= start_date)
    if end_date:
        query = query.filter(DailyRecord.record_date <= end_date)

    records = query.all()

    # 按日期分组
    daily_data = {}
    for record in records:
        date_str = record.record_date.isoformat()
        if date_str not in daily_data:
            daily_data[date_str] = {
                "date": date_str,
                "income": 0,
                "expense": 0,
                "records": []
            }

        if record.record_type == "income":
            daily_data[date_str]["income"] += record.amount
        else:
            daily_data[date_str]["expense"] += record.amount

        category = db.query(Category).filter(Category.id == record.category_id).first()
        subcategory = db.query(SubCategory).filter(SubCategory.id == record.subcategory_id).first()

        daily_data[date_str]["records"].append({
            "id": record.id,
            "record_type": record.record_type,
            "category_name": category.name if category else "",
            "subcategory_name": subcategory.name if subcategory else "",
            "amount": record.amount,
            "note": record.note
        })

    result = list(daily_data.values())
    return result

# 获取模板列表
@app.get("/api/accounting/templates")
async def get_templates(request: Request, db: Session = Depends(get_db)):
    check_auth(request)
    templates = db.query(RecordTemplate).order_by(RecordTemplate.created_at.desc()).all()

    result = []
    for template in templates:
        category = db.query(Category).filter(Category.id == template.category_id).first()
        subcategory = db.query(SubCategory).filter(SubCategory.id == template.subcategory_id).first()

        result.append({
            "id": template.id,
            "name": template.name,
            "record_type": template.record_type,
            "category_id": template.category_id,
            "category_name": category.name if category else "",
            "subcategory_id": template.subcategory_id,
            "subcategory_name": subcategory.name if subcategory else "",
            "amount": format_amount_float(template.amount),
            "note": template.note
        })

    return result

# 创建模板
@app.post("/api/accounting/templates")
async def create_template(request: Request, template: TemplateCreate, db: Session = Depends(get_db)):
    check_auth(request)
    db_template = RecordTemplate(
        name=template.name,
        record_type=template.record_type,
        category_id=template.category_id,
        subcategory_id=template.subcategory_id,
        amount=template.amount,
        note=template.note
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return {
        "id": db_template.id,
        "message": "模板创建成功"
    }

# 删除模板
@app.delete("/api/accounting/templates/{template_id}")
async def delete_template(request: Request, template_id: int, db: Session = Depends(get_db)):
    check_auth(request)
    db_template = db.query(RecordTemplate).filter(RecordTemplate.id == template_id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="模板不存在")
    db.delete(db_template)
    db.commit()
    return {"message": "模板删除成功"}

# 记账页面路由
@app.get("/accounting", response_class=HTMLResponse)
async def read_accounting(request: Request):
    check_auth(request)
    return templates.TemplateResponse("accounting.html", {"request": request})

# 分类支出统计页面路由
@app.get("/category-stats", response_class=HTMLResponse)
async def read_category_stats(request: Request):
    check_auth(request)
    return templates.TemplateResponse("category_stats.html", {"request": request})

# 分类支出详情页面路由
@app.get("/category-detail", response_class=HTMLResponse)
async def read_category_detail(request: Request):
    check_auth(request)
    return templates.TemplateResponse("category_detail.html", {"request": request})

# 分类收入统计页面路由
@app.get("/income-stats", response_class=HTMLResponse)
async def read_income_stats(request: Request):
    check_auth(request)
    return templates.TemplateResponse("income_stats.html", {"request": request})

# 分类收入详情页面路由
@app.get("/income-detail", response_class=HTMLResponse)
async def read_income_detail(request: Request):
    check_auth(request)
    return templates.TemplateResponse("income_detail.html", {"request": request})

# 年度概览页面路由
@app.get("/yearly-overview", response_class=HTMLResponse)
async def read_yearly_overview(request: Request):
    check_auth(request)
    return templates.TemplateResponse("yearly_overview.html", {"request": request})

# ==================== 分类统计API ====================

# 获取分类统计数据（支持收入和支出）
@app.get("/api/accounting/category-stats")
async def get_category_stats(
    request: Request,
    start_date: str,
    end_date: str,
    type: str = "expense",
    db: Session = Depends(get_db)
):
    """获取指定时间范围内的分类统计（type: 'income' 或 'expense'）"""
    check_auth(request)

    # 查询指定时间范围内的记录
    query = db.query(DailyRecord).filter(
        DailyRecord.record_type == type,
        DailyRecord.record_date >= start_date,
        DailyRecord.record_date <= end_date
    )

    records = query.all()

    if not records:
        total_key = "total_income" if type == "income" else "total_expense"
        return {
            total_key: 0,
            "categories": []
        }

    # 计算总收入/支出
    total_amount = float(sum(r.amount for r in records))

    # 按一级类目分组统计
    from collections import defaultdict
    category_stats = defaultdict(lambda: {"amount": 0, "count": 0, "icon": "", "name": ""})

    for record in records:
        category = db.query(Category).filter(Category.id == record.category_id).first()
        if category:
            category_stats[category.id]["amount"] += float(record.amount)
            category_stats[category.id]["count"] += 1
            category_stats[category.id]["icon"] = category.icon
            category_stats[category.id]["name"] = category.name

    # 转换为列表并计算百分比
    categories = []
    for cat_id, stats in category_stats.items():
        percent = (stats["amount"] / total_amount * 100) if total_amount > 0 else 0
        categories.append({
            "id": cat_id,
            "name": stats["name"],
            "icon": stats["icon"],
            "amount": round(stats["amount"], 2),
            "record_count": stats["count"],
            "percent": round(percent, 2)
        })

    # 按金额降序排序
    categories.sort(key=lambda x: x["amount"], reverse=True)

    total_key = "total_income" if type == "income" else "total_expense"
    return {
        total_key: round(total_amount, 2),
        "categories": categories
    }

# 获取分类详情（支持收入和支出）
@app.get("/api/accounting/category-detail/{category_id}")
async def get_category_detail(
    request: Request,
    category_id: int,
    start_date: str,
    end_date: str,
    type: str = "expense",
    db: Session = Depends(get_db)
):
    """获取指定分类在指定时间范围内的详细记录（type: 'income' 或 'expense'）"""
    check_auth(request)

    # 获取分类信息
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")

    # 查询该分类的记录（根据type参数）
    records = db.query(DailyRecord).filter(
        DailyRecord.record_type == type,
        DailyRecord.category_id == category_id,
        DailyRecord.record_date >= start_date,
        DailyRecord.record_date <= end_date
    ).order_by(DailyRecord.record_date.desc(), DailyRecord.created_at.desc()).all()

    # 计算统计信息
    total_amount = sum(r.amount for r in records)
    record_count = len(records)
    avg_amount = total_amount / record_count if record_count > 0 else 0

    # 构建记录详情列表
    records_detail = []
    for record in records:
        subcategory = db.query(SubCategory).filter(SubCategory.id == record.subcategory_id).first()
        records_detail.append({
            "id": record.id,
            "record_date": record.record_date.isoformat(),
            "amount": format_amount_float(record.amount),
            "note": record.note,
            "subcategory_name": subcategory.name if subcategory else ""
        })

    return {
        "category_id": category_id,
        "category_name": category.name,
        "category_icon": category.icon,
        "total_amount": format_amount_float(total_amount),
        "record_count": record_count,
        "avg_amount": format_amount_float(avg_amount),
        "records": records_detail
    }

# ==================== CSV导出API ====================

# 导出记账记录为CSV
@app.get("/api/accounting/export/csv")
async def export_accounting_csv(request: Request, db: Session = Depends(get_db)):
    check_auth(request)
    records = db.query(DailyRecord).order_by(DailyRecord.record_date.desc(), DailyRecord.created_at.desc()).all()

    # 创建CSV
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['日期', '类型', '一级类目', '二级类目', '金额', '备注', '创建时间'])

    for record in records:
        category = db.query(Category).filter(Category.id == record.category_id).first()
        subcategory = db.query(SubCategory).filter(SubCategory.id == record.subcategory_id).first()

        type_name = '收入' if record.record_type == 'income' else '支出'
        category_name = category.name if category else ''
        subcategory_name = subcategory.name if subcategory else ''

        writer.writerow([
            record.record_date,
            type_name,
            category_name,
            subcategory_name,
            f"{record.amount:.2f}",
            record.note or '',
            record.created_at.strftime('%Y-%m-%d %H:%M:%S')
        ])

    csv_content = output.getvalue()
    output.close()

    return Response(
        content=csv_content.encode('utf-8-sig'),  # UTF-8 with BOM for Excel
        media_type='text/csv',
        headers={
            'Content-Disposition': f'attachment; filename=accounting_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        }
    )

# 导出反思记录为CSV
@app.get("/api/reflections/export/csv")
async def export_reflections_csv(request: Request, db: Session = Depends(get_db)):
    check_auth(request)
    # 按更新时间排序
    reflections = db.query(Reflection).order_by(Reflection.updated_at.desc()).all()

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['日期', '内容', '创建时间', '更新时间'])

    for ref in reflections:
        writer.writerow([
            ref.created_at.strftime('%Y-%m-%d'),
            ref.content,
            ref.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            ref.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        ])

    csv_content = output.getvalue()
    output.close()

    return Response(
        content=csv_content.encode('utf-8-sig'),
        media_type='text/csv',
        headers={
            'Content-Disposition': f'attachment; filename=reflections_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        }
    )

# 导出备忘录为CSV
@app.get("/api/memos/export/csv")
async def export_memos_csv(request: Request, db: Session = Depends(get_db)):
    check_auth(request)
    # 使用子查询避免对大JSON字段排序，按更新时间排序
    memo_ids_query = db.query(Memo.id).order_by(Memo.updated_at.desc())
    memo_ids = [id[0] for id in memo_ids_query.all()]
    if memo_ids:
        memos_dict = {m.id: m for m in db.query(Memo).filter(Memo.id.in_(memo_ids)).all()}
        memos = [memos_dict[id] for id in memo_ids]
    else:
        memos = []

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['内容', '状态', '创建时间', '更新时间'])

    for memo in memos:
        status = '已完成' if memo.is_completed else '待办'
        writer.writerow([
            memo.content,
            status,
            memo.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            memo.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        ])

    csv_content = output.getvalue()
    output.close()

    return Response(
        content=csv_content.encode('utf-8-sig'),
        media_type='text/csv',
        headers={
            'Content-Disposition': f'attachment; filename=memos_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        }
    )

# ==================== SQL导出API ====================

def escape_sql_string(value: str) -> str:
    """转义SQL字符串"""
    if value is None:
        return 'NULL'
    # 替换单引号为两个单引号
    return "'" + value.replace("'", "''").replace("\\", "\\\\") + "'"

def generate_insert_statement(table_name: str, columns: list, rows: list) -> str:
    """生成INSERT语句"""
    statements = []
    column_names = ', '.join(columns)

    for row in rows:
        values = []
        for value in row:
            if isinstance(value, str):
                values.append(escape_sql_string(value))
            elif isinstance(value, bool):
                values.append('1' if value else '0')
            elif value is None:
                values.append('NULL')
            elif isinstance(value, (int, float)):
                values.append(str(value))
            else:
                # 处理datetime等类型
                values.append(escape_sql_string(str(value)))

        statements.append(f"INSERT INTO {table_name} ({column_names}) VALUES ({', '.join(values)});")

    return '\n'.join(statements)

# 导出记账记录为SQL
@app.get("/api/accounting/export/sql")
async def export_accounting_sql(request: Request, db: Session = Depends(get_db)):
    check_auth(request)

    # 获取所有记账记录
    records = db.query(DailyRecord).order_by(DailyRecord.record_date.desc(), DailyRecord.created_at.desc()).all()

    # 生成INSERT语句
    insert_statements = []

    for record in records:
        insert_statements.append(
            f"INSERT INTO daily_records (id, user_id, record_type, category_id, subcategory_id, amount, record_date, note, created_at) VALUES "
            f"({record.id}, {record.user_id}, '{record.record_type}', {record.category_id}, {record.subcategory_id}, "
            f"{record.amount:.2f}, '{record.record_date}', {escape_sql_string(record.note) if record.note else 'NULL'}, "
            f"'{record.created_at.strftime('%Y-%m-%d %H:%M:%S')}');"
        )

    sql_content = f"-- 记账记录导出\n-- 导出时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n-- 共 {len(records)} 条记录\n\n"
    sql_content += "-- 记账记录表\n"
    sql_content += '\n'.join(insert_statements)

    return Response(
        content=sql_content.encode('utf-8'),
        media_type='text/plain',
        headers={
            'Content-Disposition': f'attachment; filename=accounting_{datetime.now().strftime("%Y%m%d_%H%M%S")}.sql'
        }
    )

# 导出反思记录为SQL
@app.get("/api/reflections/export/sql")
async def export_reflections_sql(request: Request, db: Session = Depends(get_db)):
    check_auth(request)

    # 获取所有反思记录，按更新时间排序
    reflections = db.query(Reflection).order_by(Reflection.updated_at.desc()).all()

    # 生成INSERT语句
    insert_statements = []

    for ref in reflections:
        insert_statements.append(
            f"INSERT INTO reflections (id, content, created_at, updated_at) VALUES "
            f"({ref.id}, {escape_sql_string(ref.content)}, "
            f"'{ref.created_at.strftime('%Y-%m-%d %H:%M:%S')}', '{ref.updated_at.strftime('%Y-%m-%d %H:%M:%S')}');"
        )

    sql_content = f"-- 反思记录导出\n-- 导出时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n-- 共 {len(reflections)} 条记录\n\n"
    sql_content += "-- 反思记录表\n"
    sql_content += '\n'.join(insert_statements)

    return Response(
        content=sql_content.encode('utf-8'),
        media_type='text/plain',
        headers={
            'Content-Disposition': f'attachment; filename=reflections_{datetime.now().strftime("%Y%m%d_%H%M%S")}.sql'
        }
    )

# 导出备忘录为SQL
@app.get("/api/memos/export/sql")
async def export_memos_sql(request: Request, db: Session = Depends(get_db)):
    check_auth(request)

    # 使用子查询避免对大JSON字段排序，按更新时间排序
    memo_ids_query = db.query(Memo.id).order_by(Memo.updated_at.desc())
    memo_ids = [id[0] for id in memo_ids_query.all()]
    if memo_ids:
        memos_dict = {m.id: m for m in db.query(Memo).filter(Memo.id.in_(memo_ids)).all()}
        memos = [memos_dict[id] for id in memo_ids]
    else:
        memos = []

    # 生成INSERT语句
    insert_statements = []

    for memo in memos:
        # 处理图片数据 - 将JSON数组转换为SQL JSON格式
        images_json = 'NULL'
        if memo.images:
            images_json = "'" + json.dumps(memo.images).replace("'", "''") + "'"

        insert_statements.append(
            f"INSERT INTO memos (id, content, is_completed, images, created_at, updated_at) VALUES "
            f"({memo.id}, {escape_sql_string(memo.content)}, {1 if memo.is_completed else 0}, "
            f"{images_json}, "
            f"'{memo.created_at.strftime('%Y-%m-%d %H:%M:%S')}', '{memo.updated_at.strftime('%Y-%m-%d %H:%M:%S')}');"
        )

    sql_content = f"-- 备忘录导出\n-- 导出时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n-- 共 {len(memos)} 条记录\n\n"
    sql_content += "-- 备忘录表\n"
    sql_content += '\n'.join(insert_statements)

    return Response(
        content=sql_content.encode('utf-8'),
        media_type='text/plain',
        headers={
            'Content-Disposition': f'attachment; filename=memos_{datetime.now().strftime("%Y%m%d_%H%M%S")}.sql'
        }
    )

# 登出路由
@app.post("/api/logout")
async def logout(request: Request):
    """登出"""
    request.session.clear()
    return {"success": True, "message": "已登出"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)