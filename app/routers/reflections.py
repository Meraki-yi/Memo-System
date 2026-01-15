"""
记事路由模块

处理记事的增删改查、导出等操作
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import datetime
from zoneinfo import ZoneInfo
import csv
from io import StringIO

from app.models import Reflection
from app.schemas import ReflectionCreate, ReflectionUpdate
from app.core.database import get_db
from app.core.security import check_auth
from app.utils import escape_sql_string


router = APIRouter(tags=["记事"])

# 时区配置
LOCAL_TZ = ZoneInfo("Asia/Shanghai")


@router.get("/api/reflections")
async def get_reflections(
    request: Request,
    page: int = 1,
    page_size: int = 5,
    db: Session = Depends(get_db)
):
    """
    获取记事列表（分页）

    按创建时间倒序排列
    """
    check_auth(request)
    # 计算总数
    total = db.query(Reflection).count()
    # 计算总页数
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    # 分页查询 - 按创建时间排序
    offset = (page - 1) * page_size
    reflections = db.query(Reflection).order_by(Reflection.created_at.desc()).offset(offset).limit(page_size).all()
    return {
        "items": [
            {
                "id": r.id,
                "content": r.content,
                "is_frequent": getattr(r, 'is_frequent', False),
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


@router.post("/api/reflections")
async def create_reflection(
    request: Request,
    reflection: ReflectionCreate,
    db: Session = Depends(get_db)
):
    """创建记事"""
    check_auth(request)
    db_reflection = Reflection(
        content=reflection.content,
        is_frequent=reflection.is_frequent if reflection.is_frequent is not None else False
    )
    db.add(db_reflection)
    db.commit()
    db.refresh(db_reflection)
    return {
        "id": db_reflection.id,
        "content": db_reflection.content,
        "is_frequent": getattr(db_reflection, 'is_frequent', False),
        "created_at": db_reflection.created_at.isoformat(),
        "updated_at": db_reflection.updated_at.isoformat()
    }


@router.get("/api/reflections/frequents")
async def get_frequent_reflections(
    request: Request,
    page: int = 1,
    page_size: int = 5,
    db: Session = Depends(get_db)
):
    """获取收藏的记事列表（分页）"""
    check_auth(request)
    # 计算收藏反思总数
    total = db.query(Reflection).filter(Reflection.is_frequent == True).count()
    # 计算总页数
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    # 分页查询 - 按创建时间排序
    offset = (page - 1) * page_size
    # 先获取排序后的收藏反思ID列表
    frequent_reflection_ids_query = db.query(Reflection.id).filter(Reflection.is_frequent == True).order_by(Reflection.created_at.desc()).offset(offset).limit(page_size)
    reflection_ids = [id[0] for id in frequent_reflection_ids_query.all()]
    # 再根据ID列表获取完整数据
    if reflection_ids:
        reflections = db.query(Reflection).filter(Reflection.id.in_(reflection_ids)).all()
        # 按原始ID顺序排序
        reflections_dict = {r.id: r for r in reflections}
        reflections = [reflections_dict[id] for id in reflection_ids]
    else:
        reflections = []
    return {
        "items": [
            {
                "id": r.id,
                "content": r.content,
                "is_frequent": getattr(r, 'is_frequent', False),
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


@router.get("/api/reflections/{reflection_id}")
async def get_reflection(
    request: Request,
    reflection_id: int,
    db: Session = Depends(get_db)
):
    """获取单个记事"""
    check_auth(request)
    db_reflection = db.query(Reflection).filter(Reflection.id == reflection_id).first()
    if not db_reflection:
        raise HTTPException(status_code=404, detail="Reflection not found")

    return {
        "id": db_reflection.id,
        "content": db_reflection.content,
        "is_frequent": getattr(db_reflection, 'is_frequent', False),
        "created_at": db_reflection.created_at.isoformat(),
        "updated_at": db_reflection.updated_at.isoformat()
    }


@router.put("/api/reflections/{reflection_id}")
async def update_reflection(
    request: Request,
    reflection_id: int,
    reflection: ReflectionUpdate,
    db: Session = Depends(get_db)
):
    """更新记事"""
    check_auth(request)
    db_reflection = db.query(Reflection).filter(Reflection.id == reflection_id).first()
    if not db_reflection:
        raise HTTPException(status_code=404, detail="Reflection not found")

    if reflection.content is not None:
        db_reflection.content = reflection.content
    if reflection.is_frequent is not None:
        if hasattr(db_reflection, 'is_frequent'):
            db_reflection.is_frequent = reflection.is_frequent

    db_reflection.updated_at = datetime.now(LOCAL_TZ)
    db.commit()
    db.refresh(db_reflection)
    return {
        "id": db_reflection.id,
        "content": db_reflection.content,
        "is_frequent": getattr(db_reflection, 'is_frequent', False),
        "created_at": db_reflection.created_at.isoformat(),
        "updated_at": db_reflection.updated_at.isoformat()
    }


@router.delete("/api/reflections/{reflection_id}")
async def delete_reflection(
    request: Request,
    reflection_id: int,
    db: Session = Depends(get_db)
):
    """删除记事"""
    check_auth(request)
    db_reflection = db.query(Reflection).filter(Reflection.id == reflection_id).first()
    if not db_reflection:
        raise HTTPException(status_code=404, detail="Reflection not found")

    db.delete(db_reflection)
    db.commit()
    return {"message": "Reflection deleted successfully"}


@router.get("/api/reflections/export/csv")
async def export_reflections_csv(request: Request, db: Session = Depends(get_db)):
    """导出记事为CSV文件"""
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


@router.get("/api/reflections/export/sql")
async def export_reflections_sql(request: Request, db: Session = Depends(get_db)):
    """导出记事为SQL文件"""
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
