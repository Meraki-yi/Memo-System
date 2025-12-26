"""数据库配置和模型"""
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
from config import settings


# ============================== 数据库连接 ==============================

def get_database_url():
    """获取不包含数据库名的连接URL，用于创建数据库"""
    base_url = settings.DATABASE_URL
    # 从 mysql+pymysql://root:password@localhost:3306/memo_system
    # 提取出 mysql+pymysql://root:password@localhost:3306
    return base_url.rsplit('/', 1)[0]


def create_database_if_not_exists():
    """如果数据库不存在则创建（只执行一次）"""
    from sqlalchemy import text
    import pymysql

    # 连接到 MySQL 服务器（不指定数据库）
    base_url = get_database_url()
    engine = create_engine(base_url)

    try:
        with engine.connect() as conn:
            # 检查数据库是否存在
            result = conn.execute(text(f"SHOW DATABASES LIKE '{settings.DATABASE_URL.split('/')[-1]}'"))
            if not result.fetchone():
                # 数据库不存在，创建它
                conn.execute(text(f"CREATE DATABASE {settings.DATABASE_URL.split('/')[-1]} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
                print(f"✓ 数据库 '{settings.DATABASE_URL.split('/')[-1]}' 创建成功")
            else:
                print(f"✓ 数据库 '{settings.DATABASE_URL.split('/')[-1]}' 已存在")
    except Exception as e:
        print(f"创建数据库时出错: {e}")
    finally:
        engine.dispose()


# 创建数据库（如果不存在）
create_database_if_not_exists()

# 正常的数据库连接
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ============================== 数据库模型 ==============================

class Reflection(Base):
    """反思记录表"""
    __tablename__ = "reflections"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now())
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(), onupdate=lambda: datetime.now())


class Memo(Base):
    """备忘录表"""
    __tablename__ = "memos"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now())
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(), onupdate=lambda: datetime.now())


# ============================== 创建表 ==============================

# 创建所有表（如果不存在）
Base.metadata.create_all(bind=engine)
print("✓ 数据表检查完成")


# ============================== 数据库依赖 ==============================

def get_db():
    """获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
