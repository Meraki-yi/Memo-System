#!/usr/bin/env python3
"""
数据库迁移脚本 - 为 memos 表添加缺失的字段
"""
import sys
from sqlalchemy import create_engine, text
from config import settings

def migrate():
    """执行数据库迁移"""
    try:
        # 创建数据库连接
        engine = create_engine(settings.DATABASE_URL)

        with engine.connect() as conn:
            # 检查并添加 is_frequent 字段
            try:
                conn.execute(text("ALTER TABLE memos ADD COLUMN is_frequent BOOLEAN DEFAULT FALSE"))
                print("✓ 成功添加 is_frequent 字段")
            except Exception as e:
                if "Duplicate column name" in str(e) or "duplicate column" in str(e):
                    print("⊙ is_frequent 字段已存在，跳过")
                else:
                    print(f"✗ 添加 is_frequent 字段失败: {e}")

            # 检查并添加 images 字段
            try:
                conn.execute(text("ALTER TABLE memos ADD COLUMN images JSON NULL"))
                print("✓ 成功添加 images 字段")
            except Exception as e:
                if "Duplicate column name" in str(e) or "duplicate column" in str(e):
                    print("⊙ images 字段已存在，跳过")
                else:
                    print(f"✗ 添加 images 字段失败: {e}")

            # 提交更改
            conn.commit()
            print("\n数据库迁移完成!")

    except Exception as e:
        print(f"迁移失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate()
