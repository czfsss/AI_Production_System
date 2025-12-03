import asyncio
import sys
import os

# Add app directory to sys.path so 'models' module can be found
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

from tortoise import Tortoise
from app.settings import TORTOISE_ORM

async def inspect():
    await Tortoise.init(config=TORTOISE_ORM)
    conn = Tortoise.get_connection("default")
    # Check columns in menu table
    result = await conn.execute_query("SHOW COLUMNS FROM menu")
    print("Columns in menu table:")
    for row in result[1]:
        print(row)
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(inspect())
