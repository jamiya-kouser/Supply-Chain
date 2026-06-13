from datetime import datetime, timezone
from typing import Optional
from app.database.collections import get_shipments_collection
from app.websocket.manager import ws_manager
from app.websocket import events


class ShipmentService:
    """Business logic for shipment management."""

    async def get_all_shipments(
        self,
        status: Optional[str] = None,
        carrier: Optional[str] = None,
        limit: int = 50,
        skip: int = 0,
    ) -> list[dict]:
        """List all shipments with optional filters."""
        collection = get_shipments_collection()
        query: dict = {}
        if status:
            query["status"] = status
        if carrier:
            query["carrier.name"] = carrier

        cursor = collection.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1)
        return await cursor.to_list(length=limit)

    async def get_status(self, shipment_id: str) -> dict:
        """Get the current status and details of a shipment."""
        collection = get_shipments_collection()
        shipment = await collection.find_one(
            {"shipment_id": shipment_id}, {"_id": 0}
        )

        if not shipment:
            return {
                "found": False,
                "message": f"No shipment found with ID {shipment_id}",
            }

        return {
            "found": True,
            "shipment_id": shipment["shipment_id"],
            "status": shipment["status"],
            "origin": shipment.get("origin"),
            "destination": shipment.get("destination"),
            "current_location": shipment.get("current_location"),
            "eta": shipment.get("destination", {}).get("expected_arrival"),
            "carrier": shipment.get("carrier"),
            "total_items": shipment.get("total_items"),
            "last_updated": shipment.get("updated_at"),
        }

    async def update_status(
        self,
        shipment_id: str,
        status: str,
        notes: Optional[str] = None,
        delivery_timestamp: Optional[str] = None,
        received_by: Optional[str] = None,
    ) -> dict:
        """Update the status of a shipment and append to status history."""
        collection = get_shipments_collection()
        now = datetime.now(timezone.utc).isoformat()

        # Get current shipment for history
        existing = await collection.find_one({"shipment_id": shipment_id})
        if not existing:
            return {"success": False, "message": f"Shipment {shipment_id} not found"}

        previous_status = existing["status"]

        history_entry = {
            "status": status,
            "timestamp": delivery_timestamp or now,
            "note": notes,
        }

        update_fields: dict = {
            "status": status,
            "updated_at": now,
        }

        result = await collection.update_one(
            {"shipment_id": shipment_id},
            {
                "$set": update_fields,
                "$push": {"status_history": history_entry},
            },
        )

        if result.modified_count == 0:
            return {"success": False, "message": "Failed to update shipment"}

        # Emit WebSocket events
        if status == "delivered":
            event = events.delivery_completed(
                shipment_id=shipment_id,
                received_by=received_by or "Unknown",
                notes=notes,
            )
            await ws_manager.broadcast("dispatch", event)

        return {
            "success": True,
            "shipment_id": shipment_id,
            "previous_status": previous_status,
            "new_status": status,
            "updated_at": now,
        }

    async def recalculate_eta(self, shipment_id: str) -> dict:
        """Recalculate the ETA for a shipment based on current location data."""
        collection = get_shipments_collection()
        shipment = await collection.find_one(
            {"shipment_id": shipment_id}, {"_id": 0}
        )

        if not shipment:
            return {"success": False, "message": f"Shipment {shipment_id} not found"}

        old_eta = shipment.get("destination", {}).get("expected_arrival", "unknown")

        # Simplified ETA recalculation — in production this would use
        # real mapping/distance APIs. Here we add 2 hours to current time.
        now = datetime.now(timezone.utc)
        from datetime import timedelta

        new_eta_dt = now + timedelta(hours=2)
        new_eta = new_eta_dt.isoformat() + "Z"

        await collection.update_one(
            {"shipment_id": shipment_id},
            {
                "$set": {
                    "destination.expected_arrival": new_eta,
                    "updated_at": now.isoformat(),
                }
            },
        )

        # Emit ETA update event
        event = events.eta_update(
            shipment_id=shipment_id,
            old_eta=old_eta,
            new_eta=new_eta,
            reason="Dynamic recalculation based on current location",
        )
        await ws_manager.broadcast("dispatch", event)

        return {
            "success": True,
            "shipment_id": shipment_id,
            "old_eta": old_eta,
            "new_eta": new_eta,
        }
