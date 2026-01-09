"""
备忘录路由模块

处理备忘录的增删改查、导出等操作
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import datetime
from zoneinfo import ZoneInfo
import csv
from io import StringIO

from app.models import Memo
from app.schemas import MemoCreate, MemoUpdate
from app.core.database import get_db
from app.core.security import check_auth
from app.utils import escape_sql_string


router = APIRouter(tags=["备忘录"])

# 时区配置
LOCAL_TZ = ZoneInfo("Asia/Shanghai")


@router.get("/api/memos")
async def get_memos(
    request: Request,
    page: int = 1,
    page_size: int = 5,
    db: Session = Depends(get_db)
):
    """
    获取备忘录列表（分页）

    按创建时间倒序排列
    """
    check_auth(request)
    try:
        # 计算总数
        total = db.query(Memo).count()
        # 计算总页数
        total_pages = (total + page_size - 1) // page_size if total > 0 else 1
        # 分页查询 - 按创建时间排序
        offset = (page - 1) * page_size
        # 先获取排序后的ID列表
        memo_ids_query = db.query(Memo.id).order_by(Memo.created_at.desc()).offset(offset).limit(page_size)
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
                    "is_completed": getattr(m, 'is_completed', False),
                    "is_frequent": getattr(m, 'is_frequent', False),
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
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"获取备忘录失败: {str(e)}\n{error_detail}")


@router.post("/api/memos")
async def create_memo(
    request: Request,
    memo: MemoCreate,
    db: Session = Depends(get_db)
):
    """创建备忘录"""
    check_auth(request)
    db_memo = Memo(
        content=memo.content,
        is_completed=memo.is_completed if memo.is_completed is not None else False,
        is_frequent=memo.is_frequent if memo.is_frequent is not None else False
    )
    db.add(db_memo)
    db.commit()
    db.refresh(db_memo)
    return {
        "id": db_memo.id,
        "content": db_memo.content,
        "is_completed": getattr(db_memo, 'is_completed', False),
        "is_frequent": getattr(db_memo, 'is_frequent', False),
        "created_at": db_memo.created_at.isoformat(),
        "updated_at": db_memo.updated_at.isoformat()
    }


@router.get("/api/memos/frequents")
async def get_frequent_memos(
    request: Request,
    page: int = 1,
    page_size: int = 5,
    db: Session = Depends(get_db)
):
    """获取常用备忘录列表（分页）"""
    check_auth(request)
    # 计算常用备忘录总数
    total = db.query(Memo).filter(Memo.is_frequent == True).count()
    # 计算总页数
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    # 分页查询 - 按创建时间排序
    offset = (page - 1) * page_size
    # 先获取排序后的常用备忘录ID列表
    frequent_memo_ids_query = db.query(Memo.id).filter(Memo.is_frequent == True).order_by(Memo.created_at.desc()).offset(offset).limit(page_size)
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
                "is_completed": getattr(m, 'is_completed', False),
                "is_frequent": getattr(m, 'is_frequent', False),
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


@router.get("/api/memos/{memo_id}")
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
        "is_completed": getattr(db_memo, 'is_completed', False),
        "is_frequent": getattr(db_memo, 'is_frequent', False),
        "created_at": db_memo.created_at.isoformat(),
        "updated_at": db_memo.updated_at.isoformat()
    }


@router.put("/api/memos/{memo_id}")
async def update_memo(
    request: Request,
    memo_id: int,
    memo: MemoUpdate,
    db: Session = Depends(get_db)
):
    """更新备忘录"""
    check_auth(request)
    db_memo = db.query(Memo).filter(Memo.id == memo_id).first()
    if not db_memo:
        raise HTTPException(status_code=404, detail="Memo not found")

    if memo.content is not None:
        db_memo.content = memo.content
    if memo.is_completed is not None:
        if hasattr(db_memo, 'is_completed'):
            db_memo.is_completed = memo.is_completed
    if memo.is_frequent is not None:
        if hasattr(db_memo, 'is_frequent'):
            db_memo.is_frequent = memo.is_frequent

    db_memo.updated_at = datetime.now(LOCAL_TZ)
    db.commit()
    db.refresh(db_memo)
    return {
        "id": db_memo.id,
        "content": db_memo.content,
        "is_completed": getattr(db_memo, 'is_completed', False),
        "is_frequent": getattr(db_memo, 'is_frequent', False),
        "created_at": db_memo.created_at.isoformat(),
        "updated_at": db_memo.updated_at.isoformat()
    }


@router.delete("/api/memos/{memo_id}")
async def delete_memo(
    request: Request,
    memo_id: int,
    db: Session = Depends(get_db)
):
    """删除备忘录"""
    check_auth(request)
    db_memo = db.query(Memo).filter(Memo.id == memo_id).first()
    if not db_memo:
        raise HTTPException(status_code=404, detail="Memo not found")

    db.delete(db_memo)
    db.commit()
    return {"message": "Memo deleted successfully"}


@router.get("/api/memos/export/csv")
async def export_memos_csv(request: Request, db: Session = Depends(get_db)):
    """导出备忘录为CSV文件"""
    check_auth(request)
    # 按更新时间排序
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


@router.get("/api/memos/export/sql")
async def export_memos_sql(request: Request, db: Session = Depends(get_db)):
    """导出备忘录为SQL文件"""
    check_auth(request)

    # 按更新时间排序
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
        insert_statements.append(
            f"INSERT INTO memos (id, content, is_completed, is_frequent, created_at, updated_at) VALUES "
            f"({memo.id}, {escape_sql_string(memo.content)}, {1 if getattr(memo, 'is_completed', False) else 0}, "
            f"{1 if getattr(memo, 'is_frequent', False) else 0}, "
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
