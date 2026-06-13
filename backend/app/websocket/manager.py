"""
WebSocket connection manager.

Supports both channel-based broadcasting (generic) and
specific pools for transcripts, dashboard, and dispatch.
"""

from fastapi import WebSocket
from typing import Dict, List
import logging
import json

logger = logging.getLogger(__name__)


class WebSocketManager:
    """Manages WebSocket connections and broadcasts real-time events."""

    def __init__(self):
        # channel -> list of active websocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, channel: str, websocket: WebSocket) -> None:
        """Accept and register a WebSocket connection to a channel."""
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        self.active_connections[channel].append(websocket)
        logger.info("WS connected — channel=%s (total=%d)", channel, len(self.active_connections[channel]))

    def disconnect(self, channel: str, websocket: WebSocket) -> None:
        """Remove a WebSocket connection from a channel."""
        if channel in self.active_connections:
            self.active_connections[channel].remove(websocket)
            if not self.active_connections[channel]:
                del self.active_connections[channel]
        logger.info("WS disconnected — channel=%s", channel)

    async def broadcast(self, channel: str, event: dict) -> None:
        """Broadcast an event to all connections on a channel."""
        connections = self.active_connections.get(channel, [])
        disconnected = []
        for connection in connections:
            try:
                await connection.send_json(event)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(channel, conn)

    async def send_personal(self, websocket: WebSocket, event: dict) -> None:
        """Send an event to a specific WebSocket connection."""
        await websocket.send_json(event)

    async def broadcast_event(self, session_id: str, event: dict) -> None:
        """Convenience: broadcast to both the session channel and dashboard."""
        await self.broadcast(session_id, event)
        await self.broadcast("dashboard", event)


# Singleton instance used across the application
ws_manager = WebSocketManager()
