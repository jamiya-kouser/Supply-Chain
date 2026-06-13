from datetime import datetime, timezone
from typing import Optional
import uuid
import random
from app.database.collections import get_delivery_schedules_collection


class DeliveryService:
    """Business logic for delivery scheduling."""

    async def get_all_schedules(
        self,
        warehouse_id: Optional[str] = None,
        status: Optional[str] = None,
        date: Optional[str] = None,
        limit: int = 50,
        skip: int = 0,
    ) -> list[dict]:
        """List delivery schedules with optional filters."""
        collection = get_delivery_schedules_collection()
        query: dict = {}
        if warehouse_id:
            query["warehouse_id"] = warehouse_id
        if status:
            query["status"] = status
        if date:
            query["scheduled_date"] = date

        cursor = collection.find(query, {"_id": 0}).skip(skip).limit(limit).sort("scheduled_date", -1)
        return await cursor.to_list(length=limit)

    async def schedule_delivery(
        self,
        warehouse_id: str,
        date: str,
        time: str,
        shipment_id: Optional[str] = None,
        duration_hours: float = 2.0,
        notes: Optional[str] = None,
    ) -> dict:
        """Schedule a new delivery at a warehouse."""
        collection = get_delivery_schedules_collection()
        now = datetime.now(timezone.utc).isoformat()

        # Check for conflicting slots
        conflict = await collection.find_one({
            "warehouse_id": warehouse_id,
            "scheduled_date": date,
            "scheduled_time": time,
            "status": {"$in": ["confirmed", "pending"]},
        })

        if conflict:
            return {
                "success": False,
                "message": f"Time slot {time} on {date} is already booked at {warehouse_id}",
                "conflict_schedule_id": conflict.get("schedule_id"),
            }

        # Generate schedule ID and dock assignment
        short_id = uuid.uuid4().hex[:6].upper()
        schedule_id = f"DS-{datetime.now().strftime('%Y')}-{short_id}"
        dock = f"Bay {random.randint(1, 8)}"

        schedule_doc = {
            "schedule_id": schedule_id,
            "warehouse_id": warehouse_id,
            "shipment_id": shipment_id,
            "scheduled_date": date,
            "scheduled_time": time,
            "duration_hours": duration_hours,
            "dock_assignment": dock,
            "status": "confirmed",
            "assigned_staff": [],
            "equipment_needed": [],
            "notes": notes,
            "created_at": now,
            "updated_at": now,
        }

        await collection.insert_one(schedule_doc)
        schedule_doc.pop("_id", None)
        return {"success": True, **schedule_doc}

    async def reschedule_delivery(
        self,
        schedule_id: str,
        new_date: Optional[str] = None,
        new_time: Optional[str] = None,
        reason: Optional[str] = None,
    ) -> dict:
        """Reschedule an existing delivery."""
        collection = get_delivery_schedules_collection()
        now = datetime.now(timezone.utc).isoformat()

        existing = await collection.find_one({"schedule_id": schedule_id})
        if not existing:
            return {"success": False, "message": f"Schedule {schedule_id} not found"}

        update_fields: dict = {"updated_at": now}
        if new_date:
            update_fields["scheduled_date"] = new_date
        if new_time:
            update_fields["scheduled_time"] = new_time
        if reason:
            update_fields["notes"] = f"Rescheduled: {reason}"

        await collection.update_one(
            {"schedule_id": schedule_id},
            {"$set": update_fields},
        )

        return {
            "success": True,
            "schedule_id": schedule_id,
            "previous_date": existing.get("scheduled_date"),
            "previous_time": existing.get("scheduled_time"),
            "new_date": new_date or existing.get("scheduled_date"),
            "new_time": new_time or existing.get("scheduled_time"),
            "updated_at": now,
        }

    async def get_schedule(self, schedule_id: str) -> dict:
        """Get details of a specific schedule."""
        collection = get_delivery_schedules_collection()
        schedule = await collection.find_one(
            {"schedule_id": schedule_id}, {"_id": 0}
        )
        if not schedule:
            return {"found": False, "message": f"Schedule {schedule_id} not found"}
        return {"found": True, **schedule}
