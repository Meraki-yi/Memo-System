"""
待完成路由模块

处理待完成的增删改查、导出等操作
支持基于日期的待完成事项管理
"""

from fastapi import APIRouter, HTTPException, Depends, Request, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import datetime, date
from zoneinfo import ZoneInfo
import csv
from io import StringIO

from app.models import Memo
from app.schemas import MemoCreate, MemoUpdate
from app.core.database import get_db
from app.core.security import check_auth
from app.utils import escape_sql_string


router = APIRouter(tags=["待完成"])

# 时区配置
LOCAL_TZ = ZoneInfo("Asia/Shanghai")


def get_latest_date_with_memos(db: Session) -> date | None:
    """获取最近一次有记录的日期"""
    latest = db.query(Memo.created_date).order_by(Memo.created_date.desc()).first()
    return latest[0] if latest else None


@router.get("/api/memos")
async def get_memos(
    request: Request,
    created_date: str | None = Query(None, description="创建日期 (YYYY-MM-DD)"),
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db)
):
    """
    获取待完成列表（严格按创建日期隔离）

    仅返回指定创建日期的待办事项：
    - 每个事项严格归属于其创建日期
    - 不跨日期聚合，不显示其他日期的事项
    - 无论事项是否完成，都保留在原始创建日期下

    - created_date: 查询指定创建日期的待完成事项，格式为 YYYY-MM-DD
    - 如果未指定 created_date，自动使用今天日期
    """
    check_auth(request)
    try:
        # 解析创建日期
        if created_date:
            try:
                query_date = date.fromisoformat(created_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="日期格式无效，请使用 YYYY-MM-DD 格式")
        else:
            query_date = date.today()

        # 严格按创建日期查询事项
        query = db.query(Memo).filter(Memo.created_date == query_date)

        # 计算总数
        total = query.count()
        total_pages = (total + page_size - 1) // page_size if total > 0 else 1

        # 分页查询 - 按创建时间降序排序
        offset = (page - 1) * page_size
        memos = query.order_by(Memo.created_at.desc()).offset(offset).limit(page_size).all()

        return {
            "items": [
                {
                    "id": m.id,
                    "content": m.content,
                    "is_completed": m.is_completed,
                    "created_date": m.created_date.isoformat(),
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
            },
            "created_date": query_date.isoformat(),
            "latest_date": get_latest_date_with_memos(db).isoformat() if get_latest_date_with_memos(db) else None
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"获取待完成失败: {str(e)}\n{error_detail}")


@router.get("/api/memos/dates")
async def get_memo_dates(
    request: Request,
    db: Session = Depends(get_db)
):
    """获取所有有待完成记录的创建日期列表（按日期倒序）"""
    check_auth(request)
    try:
        # 查询所有唯一的 created_date，按日期倒序
        dates = db.query(Memo.created_date).distinct().order_by(
            Memo.created_date.desc()
        ).all()

        return {
            "dates": [d[0].isoformat() for d in dates]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取日期列表失败: {str(e)}")


@router.post("/api/memos")
async def create_memo(
    request: Request,
    memo: MemoCreate,
    db: Session = Depends(get_db)
):
    """创建待完成"""
    check_auth(request)

    # 如果没有指定 created_date，默认使用今天
    created_date = memo.created_date or date.today()

    db_memo = Memo(
        content=memo.content,
        is_completed=memo.is_completed if memo.is_completed is not None else False,
        created_date=created_date  # 事项归属于创建日期，不可更改
    )
    db.add(db_memo)
    db.commit()
    db.refresh(db_memo)
    return {
        "id": db_memo.id,
        "content": db_memo.content,
        "is_completed": db_memo.is_completed,
        "created_date": db_memo.created_date.isoformat(),
        "created_at": db_memo.created_at.isoformat(),
        "updated_at": db_memo.updated_at.isoformat()
    }


@router.get("/api/memos/{memo_id}")
async def get_memo(
    request: Request,
    memo_id: int,
    db: Session = Depends(get_db)
):
    """获取单个待完成"""
    check_auth(request)
    db_memo = db.query(Memo).filter(Memo.id == memo_id).first()
    if not db_memo:
        raise HTTPException(status_code=404, detail="Memo not found")

    return {
        "id": db_memo.id,
        "content": db_memo.content,
        "is_completed": db_memo.is_completed,
        "created_date": db_memo.created_date.isoformat(),
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
    """更新待完成（不允许修改创建日期）"""
    check_auth(request)
    db_memo = db.query(Memo).filter(Memo.id == memo_id).first()
    if not db_memo:
        raise HTTPException(status_code=404, detail="Memo not found")

    if memo.content is not None:
        db_memo.content = memo.content
    if memo.is_completed is not None:
        db_memo.is_completed = memo.is_completed
    # 注意：不允许修改 created_date，事项归属日期在创建时确定后不可变更

    db_memo.updated_at = datetime.now(LOCAL_TZ)
    db.commit()
    db.refresh(db_memo)
    return {
        "id": db_memo.id,
        "content": db_memo.content,
        "is_completed": db_memo.is_completed,
        "created_date": db_memo.created_date.isoformat(),
        "created_at": db_memo.created_at.isoformat(),
        "updated_at": db_memo.updated_at.isoformat()
    }


@router.delete("/api/memos/{memo_id}")
async def delete_memo(
    request: Request,
    memo_id: int,
    db: Session = Depends(get_db)
):
    """删除待完成"""
    check_auth(request)
    db_memo = db.query(Memo).filter(Memo.id == memo_id).first()
    if not db_memo:
        raise HTTPException(status_code=404, detail="Memo not found")

    db.delete(db_memo)
    db.commit()
    return {"message": "Memo deleted successfully"}


@router.get("/api/memos/export/csv")
async def export_memos_csv(request: Request, db: Session = Depends(get_db)):
    """导出待完成为CSV文件"""
    check_auth(request)
    # 按创建日期和更新时间排序
    memos = db.query(Memo).order_by(Memo.created_date.desc(), Memo.updated_at.desc()).all()

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['内容', '状态', '创建日期', '创建时间', '更新时间'])

    for memo in memos:
        status = '已完成' if memo.is_completed else '待办'
        writer.writerow([
            memo.content,
            status,
            memo.created_date.isoformat(),
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


@router.post("/api/memos/migrate")
async def migrate_memos_to_next_day(
    request: Request,
    from_date: str | None = Query(None, description="源日期 (YYYY-MM-DD)，未指定则使用今天"),
    db: Session = Depends(get_db)
):
    """
    将指定日期的未完成待完成事项迁移到下一天

    迁移规则：
    - 只迁移未完成的待完成事项（is_completed = False）
    - 将事项的 created_date 修改为下一天
    - 保留事项的其他属性（内容、创建时间等）
    - 迁移后的事项不会在原日期显示

    参数：
    - from_date: 源日期，格式为 YYYY-MM-DD。如果未指定，默认使用今天
    """
    check_auth(request)
    try:
        # 解析源日期
        if from_date:
            try:
                source_date = date.fromisoformat(from_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="日期格式无效，请使用 YYYY-MM-DD 格式")
        else:
            source_date = date.today()

        # 计算下一天
        from datetime import timedelta
        next_day = source_date + timedelta(days=1)

        # 查询源日期下所有未完成的待完成事项
        uncompleted_memos = db.query(Memo).filter(
            Memo.created_date == source_date,
            Memo.is_completed == False
        ).all()

        if not uncompleted_memos:
            return {
                "message": "没有需要迁移的待完成事项",
                "migrated_count": 0,
                "from_date": source_date.isoformat(),
                "to_date": next_day.isoformat()
            }

        # 批量更新创建日期为下一天
        migrated_count = 0
        for memo in uncompleted_memos:
            memo.created_date = next_day
            memo.updated_at = datetime.now(LOCAL_TZ)
            migrated_count += 1

        db.commit()

        return {
            "message": f"成功迁移 {migrated_count} 条待完成事项到 {next_day.isoformat()}",
            "migrated_count": migrated_count,
            "from_date": source_date.isoformat(),
            "to_date": next_day.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        error_detail = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"迁移待完成失败: {str(e)}\n{error_detail}")


@router.get("/api/memos/export/sql")
async def export_memos_sql(request: Request, db: Session = Depends(get_db)):
    """导出待完成为SQL文件"""
    check_auth(request)

    # 按创建日期和更新时间排序
    memos = db.query(Memo).order_by(Memo.created_date.desc(), Memo.updated_at.desc()).all()

    # 生成INSERT语句
    insert_statements = []

    for memo in memos:
        insert_statements.append(
            f"INSERT INTO memos (id, content, is_completed, created_date, created_at, updated_at) VALUES "
            f"({memo.id}, {escape_sql_string(memo.content)}, {1 if memo.is_completed else 0}, "
            f"'{memo.created_date.isoformat()}', "
            f"'{memo.created_at.strftime('%Y-%m-%d %H:%M:%S')}', '{memo.updated_at.strftime('%Y-%m-%d %H:%M:%S')}');"
        )

    sql_content = f"-- 待完成导出\n-- 导出时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n-- 共 {len(memos)} 条记录\n\n"
    sql_content += "-- 待完成表\n"
    sql_content += '\n'.join(insert_statements)

    return Response(
        content=sql_content.encode('utf-8'),
        media_type='text/plain',
        headers={
            'Content-Disposition': f'attachment; filename=memos_{datetime.now().strftime("%Y%m%d_%H%M%S")}.sql'
        }
    )
