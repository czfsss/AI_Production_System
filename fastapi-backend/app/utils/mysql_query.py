import aiomysql
import asyncio
import logging
from typing import List, Dict, Any
from config.mysql_config import shucai, mes


async def query_mysql(sql: str, mysql_config: dict, timeout=30):
    """
    异步查询MySQL数据库的函数（直接连接方式）

    Args:
        sql (str): SQL查询语句
        mysql_config (dict): 数据库配置
        timeout (int): 查询超时时间（秒），默认30秒

    Returns:
        List[Dict[str, Any]]: 查询结果
    """
    connection = None
    try:
        # 直接建立数据库连接
        connection = await asyncio.wait_for(
            aiomysql.connect(
                host=mysql_config["host"],
                port=mysql_config["port"],
                user=mysql_config["user"],
                password=mysql_config["password"],
                db=mysql_config["database"],
                charset="utf8mb4",
                cursorclass=aiomysql.DictCursor,
                autocommit=True,
            ),
            timeout,
        )

        async with connection.cursor() as cursor:
            # 执行带超时的查询
            await asyncio.wait_for(cursor.execute(sql), timeout)
            result = await cursor.fetchall()
            return result

    except asyncio.TimeoutError:
        logging.error(f"查询超时: {sql}")
        return [{"error": "查询超时", "sql": sql}]
    except Exception as e:
        logging.error(f"查询出错: {str(e)}, SQL: {sql}")
        return [{"error": str(e), "sql": sql}]
    finally:
        # 关闭数据库连接
        if connection:
            connection.close()
