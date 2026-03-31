"""
记账功能路由模块

处理记账相关的所有操作，包括：
- 类目管理（一级、二级类目）
- 记账记录管理
- 模板管理
- 统计分析
- 数据导出
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from typing import Optional
from collections import defaultdict
import csv
from io import StringIO

from app.models import Category, SubCategory, DailyRecord, RecordTemplate
from app.schemas import (
    CategoryCreate,
    SubCategoryCreate,
    CategoryUpdate,
    SubCategoryUpdate,
    DailyRecordCreate,
    TemplateCreate
)
from app.core.database import get_db
from app.core.security import check_auth
from app.utils import format_amount_float, escape_sql_string


router = APIRouter(tags=["记账"])


# ==================== 类目管理 ====================

@router.get("/api/accounting/categories")
def get_categories(request: Request, db: Session = Depends(get_db)):
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


@router.post("/api/accounting/categories")
def create_category(request: Request, category: CategoryCreate, db: Session = Depends(get_db)):
    """创建一级类目"""
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


@router.post("/api/accounting/subcategories")
def create_subcategory(request: Request, subcategory: SubCategoryCreate, db: Session = Depends(get_db)):
    """创建二级类目"""
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


@router.delete("/api/accounting/subcategories/{subcategory_id}")
def delete_subcategory(request: Request, subcategory_id: int, db: Session = Depends(get_db)):
    """删除二级类目（需要先删除关联的记录）"""
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


@router.delete("/api/accounting/categories/{category_id}")
def delete_category(request: Request, category_id: int, db: Session = Depends(get_db)):
    """删除一级类目（需要先删除所有二级类目和记录）"""
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


@router.put("/api/accounting/categories/{category_id}")
def rename_category(request: Request, category_id: int, category_data: CategoryUpdate, db: Session = Depends(get_db)):
    """重命名一级类目"""
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


@router.put("/api/accounting/subcategories/{subcategory_id}")
def rename_subcategory(request: Request, subcategory_id: int, subcategory_data: SubCategoryUpdate, db: Session = Depends(get_db)):
    """重命名二级类目"""
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


# ==================== 记账记录管理 ====================

@router.get("/api/accounting/records")
def get_records(
    request: Request,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    week_page: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """获取记账记录（支持按条数分页和按周分页）"""
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
        records_by_date = defaultdict(list)
        for record in all_records:
            records_by_date[record.record_date].append(record)

        # 获取所有有记录的日期，按降序排列
        all_dates = sorted(records_by_date.keys(), reverse=True)

        # 计算周分组
        weeks = []
        current_week = []

        for date_item in enumerate(all_dates):
            # 将日期转换为周一（周的第一天）
            monday = date_item[1] - timedelta(days=date_item[1].weekday())

            if not current_week:
                current_week = [date_item[1]]
                current_monday = monday
            elif monday == current_monday:
                # 同一周
                current_week.append(date_item[1])
            else:
                # 新的一周
                weeks.append(current_week)
                current_week = [date_item[1]]
                current_monday = monday

        # 添加最后一周
        if current_week:
            weeks.append(current_week)

        # 计算总周数
        total_weeks = len(weeks)

        # 获取请求的周（week_page 从 1 开始）
        week_index = week_page - 1

        # 如果请求的页码超出范围，返回空数据
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
        for date_item in week_dates:
            week_records.extend(records_by_date[date_item])

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


@router.post("/api/accounting/records")
def create_record(request: Request, record: DailyRecordCreate, db: Session = Depends(get_db)):
    """创建记账记录"""
    check_auth(request)

    # 验证类目是否存在
    category = db.query(Category).filter(Category.id == record.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="一级类目不存在")

    subcategory = db.query(SubCategory).filter(SubCategory.id == record.subcategory_id).first()
    if not subcategory:
        raise HTTPException(status_code=404, detail="二级类目不存在")

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


@router.get("/api/accounting/records/{record_id}")
def get_record(request: Request, record_id: int, db: Session = Depends(get_db)):
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


@router.put("/api/accounting/records/{record_id}")
def update_record(request: Request, record_id: int, record: DailyRecordCreate, db: Session = Depends(get_db)):
    """更新记账记录"""
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

    record_date = date.fromisoformat(record.record_date)

    db_record.record_type = record.record_type
    db_record.category_id = record.category_id
    db_record.subcategory_id = record.subcategory_id
    db_record.amount = round(record.amount, 2)
    db_record.record_date = record_date
    db_record.note = record.note

    db.commit()
    return {"message": "记录更新成功"}


@router.delete("/api/accounting/records/{record_id}")
def delete_record(request: Request, record_id: int, db: Session = Depends(get_db)):
    """删除记账记录"""
    check_auth(request)
    db_record = db.query(DailyRecord).filter(DailyRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="记录不存在")
    db.delete(db_record)
    db.commit()
    return {"message": "记录删除成功"}


# ==================== 模板管理 ====================

@router.get("/api/accounting/templates")
def get_templates(request: Request, db: Session = Depends(get_db)):
    """获取模板列表"""
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


@router.post("/api/accounting/templates")
def create_template(request: Request, template: TemplateCreate, db: Session = Depends(get_db)):
    """创建模板"""
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


@router.delete("/api/accounting/templates/{template_id}")
def delete_template(request: Request, template_id: int, db: Session = Depends(get_db)):
    """删除模板"""
    check_auth(request)
    db_template = db.query(RecordTemplate).filter(RecordTemplate.id == template_id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="模板不存在")
    db.delete(db_template)
    db.commit()
    return {"message": "模板删除成功"}


# ==================== 统计分析 ====================

@router.get("/api/accounting/summary")
def get_summary(
    request: Request,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取统计汇总"""
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


@router.get("/api/accounting/daily-summary")
def get_daily_summary(
    request: Request,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取每日汇总"""
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


@router.get("/api/accounting/category-stats")
def get_category_stats(
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


@router.get("/api/accounting/category-detail/{category_id}")
def get_category_detail(
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


# ==================== 数据导出 ====================

@router.get("/api/accounting/export/csv")
def export_accounting_csv(request: Request, db: Session = Depends(get_db)):
    """导出记账记录为CSV文件"""
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


@router.get("/api/accounting/export/sql")
def export_accounting_sql(request: Request, db: Session = Depends(get_db)):
    """导出记账记录为SQL文件"""
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
