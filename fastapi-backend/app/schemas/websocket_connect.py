import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from typing import Dict, Optional


# 存储活跃的WebSocket连接
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.equipment_data_cache: Dict[str, dict] = {}

    async def connect(self, websocket: WebSocket, equipment_name: str):
        await websocket.accept()
        if equipment_name not in self.active_connections:
            self.active_connections[equipment_name] = websocket
        logging.info(f"WebSocket连接已建立，设备: {equipment_name}")

    def disconnect(self, websocket: WebSocket, equipment_name: str):
        if equipment_name in self.active_connections:
            del self.active_connections[equipment_name]
            if equipment_name in self.equipment_data_cache:
                del self.equipment_data_cache[equipment_name]
        logging.info(f"WebSocket连接已断开，设备: {equipment_name}")

    async def send_personal_message(self, message: str, equipment_name: str):
        if equipment_name in self.active_connections:
            await self.active_connections[equipment_name].send_text(message)

    async def broadcast_to_equipment(self, message: str):
        for equipment_name, websocket in self.active_connections.items():
            try:
                await websocket.send_text(message)
            except WebSocketDisconnect:
                # 连接可能已经断开，移除它
                del self.active_connections[equipment_name]

    def updata_equipment_data(self, equipment_name: str, data: dict):
        self.equipment_data_cache[equipment_name] = data

    def compare_equipment_data(self, equipment_name: str, new_data: dict) -> bool:
        old_data = self.equipment_data_cache.get(equipment_name, None)
        if old_data is None:
            return True  # 如果没有旧数据，视为有变化
        return old_data != new_data
