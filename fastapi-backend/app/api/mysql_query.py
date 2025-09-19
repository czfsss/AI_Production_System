import pymysql
from typing import List, Dict, Any
from config.mysql_config import host, port, user, password, database


async def query_mysql(sql: str) -> List[Dict[str, Any]]:
    """
    查询MySQL数据库的函数
    
    Args:
        sql (str): 要执行的SQL查询语句
        
    Returns:
        List[Dict[str, Any]]: 查询结果列表
    """
    connection = None
    cursor = None
    try:
        # 建立数据库连接
        connection = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        # 创建游标
        cursor = connection.cursor()
        
        # 执行SQL查询语句
        cursor.execute(sql)
        
        # 获取查询结果
        result = cursor.fetchall()
        return result
            
    except Exception as e:
        # 发生错误时返回错误信息
        return [{"error": str(e), "sql": sql}]
    finally:
        # 关闭游标和连接
        if cursor:
            cursor.close()
        if connection:
            connection.close()