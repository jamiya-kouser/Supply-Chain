from datetime import datetime, timezone
from typing import Optional
import uuid
from app.database.collections import get_delivery_exceptions_collection
from app.websocket.manager import ws_manager
from app.websocket import events


class ExceptionService:
    """Business logic for delivery exception management."""

    async def list_exceptions(
        self,
        status: Optional[str] = None,
        shipment_id: Optional[str] = None,
        severity: Optional[str] = None,
        limit: int = 50,
        skip: int = 0,
    ) -> list[dict]:
        """List delivery exceptions with optional filters."""
        collection = get_delivery_exceptions_collection()
        query: dict = {}
        if status:
            query["status"] = status
        if shipment_id:
            query["shipment_id"] = shipment_id
        if severity:
            query["severity"] = severity

        cursor = collection.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1)
        return await cursor.to_list(length=limit)

    async def report_delivery_exception(
        self,
        shipment_id: str,
        exception_type: str,
        description: str,
        severity: str = "medium",
        reported_by: Optional[str] = None,
    ) -> dict:
        """Report a new delivery exception."""
        collection = get_delivery_exceptions_collection()
        now = datetime.now(timezone.utc).isoformat()

        short_id = uuid.uuid4().hex[:6].upper()
        exception_id = f"EX-{datetime.now().strftime('%Y')}-{short_id}"

        exception_doc = {
            "exception_id": exception_id,
            "shipment_id": shipment_id,
            "exception_type": exception_type,
            "description": description,
            "severity": severity,
            "status": "open",
            "reported_by": reported_by,
            "assigned_to": None,
            "resolution": None,
            "resolved_at": None,
            "created_at": now,
            "updated_at": now,
        }

        await collection.insert_one(exception_doc)
        exception_doc.pop("_id", None)

        # Emit WebSocket event
        event = events.delivery_exception_event(
            exception_id=exception_id,
            shipment_id=shipment_id,
            exception_type=exception_type,
            description=description,
        )
        await ws_manager.broadcast("dispatch", event)

        return {"success": True, **exception_doc}

    async def resolve_exception(
        self,
        exception_id: str,
        resolution: str,
        resolved_by: Optional[str] = None,
    ) -> dict:
        """Resolve a delivery exception."""
        collection = get_delivery_exceptions_collection()
        now = datetime.now(timezone.utc).isoformat()

        existing = await collection.find_one({"exception_id": exception_id})
        if not existing:
            return {"success": False, "message": f"Exception {exception_id} not found"}

        if existing["status"] == "resolved":
            return {"success": False, "message": f"Exception {exception_id} is already resolved"}

        await collection.update_one(
            {"exception_id": exception_id},
            {
                "$set": {
                    "status": "resolved",
                    "resolution": resolution,
                    "resolved_at": now,
                    "assigned_to": resolved_by,
                    "updated_at": now,
                }
            },
        )

        return {
            "success": True,
            "exception_id": exception_id,
            "status": "resolved",
            "resolution": resolution,
            "resolved_at": now,
        }
