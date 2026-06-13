"""
WebSocket router — real-time streaming endpoints.

Endpoints:
  /ws/transcripts/{session_id}  — per-session transcript stream
  /ws/dashboard                 — dashboard live updates
  /ws/dispatch                  — dispatch channel for driver updates
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import ws_manager
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/transcripts/{session_id}")
async def transcript_websocket(websocket: WebSocket, session_id: str):
    """
    Stream transcript events for a specific voice session.
    The frontend connects here when a voice session starts.
    """
    await ws_manager.connect_transcript(session_id, websocket)
    try:
        while True:
            # Keep the connection alive; optionally receive client messages
            data = await websocket.receive_json()
            # Client can send events back (e.g., user typing indicator)
            logger.debug("Transcript WS recv session=%s: %s", session_id, data)
    except WebSocketDisconnect:
        ws_manager.disconnect_transcript(session_id, websocket)
    except Exception as exc:
        logger.error("Transcript WS error session=%s: %s", session_id, exc)
        ws_manager.disconnect_transcript(session_id, websocket)


@router.websocket("/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    """
    Broadcast channel for dashboard real-time updates.
    Pushes shipment movements, status changes, and alerts.
    """
    await ws_manager.connect_dashboard(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            logger.debug("Dashboard WS recv: %s", data)
    except WebSocketDisconnect:
        ws_manager.disconnect_dashboard(websocket)
    except Exception as exc:
        logger.error("Dashboard WS error: %s", exc)
        ws_manager.disconnect_dashboard(websocket)


@router.websocket("/dispatch")
async def dispatch_websocket(websocket: WebSocket):
    """
    Dispatch channel for driver assignment and route updates.
    """
    await ws_manager.connect_dispatch(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            logger.debug("Dispatch WS recv: %s", data)
    except WebSocketDisconnect:
        ws_manager.disconnect_dispatch(websocket)
    except Exception as exc:
        logger.error("Dispatch WS error: %s", exc)
        ws_manager.disconnect_dispatch(websocket)
