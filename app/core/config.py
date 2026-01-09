"""
应用配置模块

提供全局配置访问和常量定义
"""

from zoneinfo import ZoneInfo

from config import settings


# 本地时区配置（根据需要修改）
LOCAL_TZ = ZoneInfo("Asia/Shanghai")  # 中国时区，如需其他时区请修改


def get_settings():
    """
    获取应用配置实例

    Returns:
        Settings: 应用配置对象
    """
    return settings


# 密码配置
ACCESS_PASSWORD = settings.ACCESS_PASSWORD
