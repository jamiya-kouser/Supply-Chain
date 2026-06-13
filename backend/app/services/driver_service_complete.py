"""
Complete DriverService with voice agent integration.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
import logging
from app.database.collections import (
    get_drivers_collection,
    get_shipments_collection,
)

logger = logging.getLogger(__name__)


class DriverService:
    """Encapsulates driver-related business logic."""

    async def verify_driver_identity(self, driver_id: str) -> Dict[str, Any]:
        """
        Verify driver by driver_id or vehicle_number.
        Used at voice session start.
        Returns verified driver info with assigned shipments.
        """
        collection = get_drivers_collection()
        driver = await collection.find_one(
            {"$or": [{"driver_id": driver_id}, {"vehicle_number": driver_id}]},
            {"_id": 0, "password_hash": 0}
        )
        if not driver:
            return {"verified": False, "message": "Driver not found"}

        # Get active shipments for briefing
        shipments_collection = get_shipments_collection()
        shipments = await shipments_collection.find(
            {
                "carrier.driver_id": driver["driver_id"],
                "status": {"$in": ["assigned", "picked_up", "in_transit"]}
            },
            {
                "shipment_id": 1,
                "destination.city": 1,
                "destination.expected_arrival": 1,
                "_id": 0
            }
        ).sort("destination.expected_arrival", 1).to_list(length=20)

        return {
            "verified": True,
            "driver_id": driver["driver_id"],
            "driver_name": driver.get("name", ""),
            "location": driver.get("current_location", {}),
            "assigned_shipments": [s.get("shipment_id") for s in shipments],
            "shipments_detail": shipments,
            "message": f"Driver {driver.get('name')} verified. You have {len(shipments)} active deliveries."
        }

    async def get_active_assignments(self, driver_id: str) -> Dict[str, Any]:
        """Get all active shipments for a driver."""
        shipments_collection = get_shipments_collection()
        shipments = await shipments_collection.find(
            {
                "carrier.driver_id": driver_id,
                "status": {"$in": ["assigned", "picked_up", "in_transit"]}
            },
            {"_id": 0}
        ).sort("destination.expected_arrival", 1).to_list(length=50)

        return {
            "driver_id": driver_id,
            "count": len(shipments),
            "shipments": shipments
        }

    async def update_driver_location(
        self,
        driver_id: str,
        latitude: float,
        longitude: float,
        address: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update driver's current GPS location."""
        collection = get_drivers_collection()
        now = datetime.utcnow()

        update_data = {
            "current_location": {
                "latitude": latitude,
                "longitude": longitude,
                "address": address,
                "updated_at": now,
            },
            "updated_at": now,
        }

        result = await collection.update_one(
            {"driver_id": driver_id},
            {"$set": update_data},
        )

        if result.matched_count == 0:
            return {"success": False, "message": f"Driver {driver_id} not found"}

        return {
            "success": True,
            "message": f"Location updated for driver {driver_id}",
            "location": {
                "latitude": latitude,
                "longitude": longitude,
                "address": address,
                "updated_at": now.isoformat(),
            },
        }

    async def get_all_drivers(
        self,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """Return a paginated list of drivers."""
        collection = get_drivers_collection()
        query: Dict[str, Any] = {}
        if status:
            query["status"] = status

        cursor = collection.find(query, {"_id": 0}).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def get_driver_by_id(self, driver_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a single driver by driver_id."""
        collection = get_drivers_collection()
        return await collection.find_one({"driver_id": driver_id}, {"_id": 0})


driver_service = DriverService()
