"""
辅助工具模块

提供通用的辅助函数和工具方法
"""


def format_amount(amount) -> str:
    """
    将金额格式化为保留两位小数的字符串

    Args:
        amount: 金额值

    Returns:
        str: 格式化后的金额字符串
    """
    if amount is None:
        return "0.00"
    return f"{float(amount):.2f}"


def format_amount_float(amount) -> float:
    """
    将金额格式化为保留两位小数的浮点数

    Args:
        amount: 金额值

    Returns:
        float: 格式化后的金额浮点数
    """
    if amount is None:
        return 0.0
    return round(float(amount), 2)


def escape_sql_string(value: str) -> str:
    """
    转义SQL字符串

    Args:
        value: 需要转义的字符串

    Returns:
        str: 转义后的SQL字符串
    """
    if value is None:
        return 'NULL'
    # 替换单引号为两个单引号
    return "'" + value.replace("'", "''").replace("\\", "\\\\") + "'"


def generate_insert_statement(table_name: str, columns: list, rows: list) -> str:
    """
    生成INSERT语句

    Args:
        table_name: 表名
        columns: 列名列表
        rows: 数据行列表

    Returns:
        str: 生成的INSERT语句
    """
    statements = []
    column_names = ', '.join(columns)

    for row in rows:
        values = []
        for value in row:
            if isinstance(value, str):
                values.append(escape_sql_string(value))
            elif isinstance(value, bool):
                values.append('1' if value else '0')
            elif value is None:
                values.append('NULL')
            elif isinstance(value, (int, float)):
                values.append(str(value))
            else:
                # 处理datetime等类型
                values.append(escape_sql_string(str(value)))

        statements.append(f"INSERT INTO {table_name} ({column_names}) VALUES ({', '.join(values)});")

    return '\n'.join(statements)
