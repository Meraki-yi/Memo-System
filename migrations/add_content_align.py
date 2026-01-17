"""
添加 content_align 字段到 reflections 表

运行方式: python migrations/add_content_align.py
"""

import sys
import os

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import engine


def add_content_align_field():
    """添加 content_align 字段到 reflections 表"""
    with engine.connect() as conn:
        # 检查字段是否已存在（MySQL语法）
        result = conn.execute(text(
            "SELECT COUNT(*) as count FROM information_schema.columns "
            "WHERE table_schema = DATABASE() AND table_name = 'reflections' AND column_name = 'content_align'"
        ))
        field_exists = result.fetchone()[0] > 0

        if field_exists:
            print("字段 content_align 已存在，无需添加")
            return

        # 添加字段（MySQL语法）
        conn.execute(text(
            "ALTER TABLE reflections ADD COLUMN content_align VARCHAR(10) DEFAULT 'center'"
        ))
        conn.commit()

        # 为现有记录设置默认值
        conn.execute(text(
            "UPDATE reflections SET content_align = 'center' WHERE content_align IS NULL"
        ))
        conn.commit()

        print("成功添加 content_align 字段到 reflections 表")


if __name__ == "__main__":
    add_content_align_field()
