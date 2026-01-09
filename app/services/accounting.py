"""
记账业务服务模块

提供记账相关的业务逻辑处理，减少路由层的重复代码
"""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models import Category, SubCategory, DailyRecord
from app.utils import format_amount_float


class AccountingService:
    """记账业务服务类"""

    @staticmethod
    def get_category_dict(db: Session) -> Dict[int, Category]:
        """
        获取所有类目的字典映射

        Args:
            db: 数据库会话

        Returns:
            Dict[int, Category]: ID 到类目的映射字典
        """
        return {cat.id: cat for cat in db.query(Category).all()}

    @staticmethod
    def get_subcategory_dict(db: Session) -> Dict[int, SubCategory]:
        """
        获取所有二级类目的字典映射

        Args:
            db: 数据库会话

        Returns:
            Dict[int, SubCategory]: ID 到二级类目的映射字典
        """
        return {sub.id: sub for sub in db.query(SubCategory).all()}

    @staticmethod
    def enrich_record_with_categories(
        record: DailyRecord,
        category: Optional[Category] = None,
        subcategory: Optional[SubCategory] = None
    ) -> Dict[str, Any]:
        """
        为记录添加类目信息

        Args:
            record: 记账记录
            category: 一级类目（可选，未提供则自动查询）
            subcategory: 二级类目（可选，未提供则自动查询）

        Returns:
            Dict[str, Any]: 包含完整信息的记录字典
        """
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

    @staticmethod
    def validate_categories_exist(
        db: Session,
        category_id: int,
        subcategory_id: int
    ) -> tuple[Optional[Category], Optional[SubCategory], Optional[str]]:
        """
        验证类目是否存在

        Args:
            db: 数据库会话
            category_id: 一级类目ID
            subcategory_id: 二级类目ID

        Returns:
            tuple: (category, subcategory, error_message)
                   如果验证成功，error_message 为 None
        """
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            return None, None, "一级类目不存在"

        subcategory = db.query(SubCategory).filter(SubCategory.id == subcategory_id).first()
        if not subcategory:
            return None, None, "二级类目不存在"

        return category, subcategory, None

    @staticmethod
    def get_record_with_categories(
        db: Session,
        record_id: int
    ) -> Optional[Dict[str, Any]]:
        """
        获取包含类目信息的记录

        Args:
            db: 数据库会话
            record_id: 记录ID

        Returns:
            Optional[Dict]: 包含完整信息的记录字典，如果不存在则返回 None
        """
        record = db.query(DailyRecord).filter(DailyRecord.id == record_id).first()
        if not record:
            return None

        category = db.query(Category).filter(Category.id == record.category_id).first()
        subcategory = db.query(SubCategory).filter(SubCategory.id == record.subcategory_id).first()

        return AccountingService.enrich_record_with_categories(
            record, category, subcategory
        )
