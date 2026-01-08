#!/usr/bin/env python3
"""
数据库迁移脚本 - 为 memos 表和 reflections 表添加缺失的字段
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
            # 检查并添加 reflections 表的 is_frequent 字段
            try:
                conn.execute(text("ALTER TABLE reflections ADD COLUMN is_frequent BOOLEAN DEFAULT FALSE"))
                print("[OK] Successfully added is_frequent column to reflections table")
            except Exception as e:
                if "Duplicate column name" in str(e) or "duplicate column" in str(e):
                    print("[SKIP] reflections.is_frequent column already exists, skipping")
                else:
                    print(f"[ERROR] Failed to add reflections.is_frequent column: {e}")

            # 检查并添加 memos 表的 is_frequent 字段
            try:
                conn.execute(text("ALTER TABLE memos ADD COLUMN is_frequent BOOLEAN DEFAULT FALSE"))
                print("[OK] Successfully added is_frequent column to memos table")
            except Exception as e:
                if "Duplicate column name" in str(e) or "duplicate column" in str(e):
                    print("[SKIP] memos.is_frequent column already exists, skipping")
                else:
                    print(f"[ERROR] Failed to add memos.is_frequent column: {e}")

            # 检查并添加 images 字段
            try:
                conn.execute(text("ALTER TABLE memos ADD COLUMN images JSON NULL"))
                print("[OK] Successfully added images column")
            except Exception as e:
                if "Duplicate column name" in str(e) or "duplicate column" in str(e):
                    print("[SKIP] images column already exists, skipping")
                else:
                    print(f"[ERROR] Failed to add images column: {e}")

            # 提交更改
            conn.commit()
            print("\nDatabase migration completed!")

    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate()
