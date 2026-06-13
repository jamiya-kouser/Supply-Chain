from datetime import datetime, timezone
from typing import Optional
import uuid
from app.database.collections import get_orders_collection


class OrderService:
    """Business logic for purchase order management."""

    async def get_all_orders(
        self,
        status: Optional[str] = None,
        supplier_id: Optional[str] = None,
        limit: int = 50,
        skip: int = 0,
    ) -> list[dict]:
        """List all orders with optional filters."""
        collection = get_orders_collection()
        query: dict = {}
        if status:
            query["status"] = status
        if supplier_id:
            query["supplier_id"] = supplier_id

        cursor = collection.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1)
        return await cursor.to_list(length=limit)

    async def create_purchase_order(
        self,
        supplier_id: str,
        items: list[dict],
        delivery_warehouse: str,
        requested_delivery_date: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> dict:
        """Create a new purchase order."""
        collection = get_orders_collection()
        now = datetime.now(timezone.utc).isoformat()

        # Generate order ID
        short_id = uuid.uuid4().hex[:6].upper()
        order_id = f"PO-{datetime.now().strftime('%Y')}-{short_id}"

        # Calculate total value
        total_value = 0.0
        for item in items:
            qty = item.get("quantity", 0)
            price = item.get("unit_price", 0)
            item["total_price"] = qty * price
            total_value += item["total_price"]

        order_doc = {
            "order_id": order_id,
            "type": "purchase_order",
            "supplier_id": supplier_id,
            "status": "pending_confirmation",
            "items": items,
            "total_value": total_value,
            "currency": "INR",
            "delivery_warehouse": delivery_warehouse,
            "requested_delivery_date": requested_delivery_date,
            "actual_delivery_date": None,
            "notes": notes,
            "status_history": [
                {
                    "status": "created",
                    "timestamp": now,
                    "user": "system",
                }
            ],
            "created_at": now,
            "updated_at": now,
        }

        await collection.insert_one(order_doc)

        # Remove MongoDB's _id from the response
        order_doc.pop("_id", None)
        return order_doc

    async def get_order_details(self, order_id: str) -> dict:
        """Get details of a specific order."""
        collection = get_orders_collection()
        order = await collection.find_one({"order_id": order_id}, {"_id": 0})

        if not order:
            return {
                "found": False,
                "message": f"No order found with ID {order_id}",
            }

        return {"found": True, **order}

    async def update_order_status(
        self,
        order_id: str,
        status: str,
        user: Optional[str] = None,
    ) -> dict:
        """Update the status of an order."""
        collection = get_orders_collection()
        now = datetime.now(timezone.utc).isoformat()

        existing = await collection.find_one({"order_id": order_id})
        if not existing:
            return {"success": False, "message": f"Order {order_id} not found"}

        previous_status = existing["status"]

        history_entry = {
            "status": status,
            "timestamp": now,
            "user": user or "system",
        }

        result = await collection.update_one(
            {"order_id": order_id},
            {
                "$set": {"status": status, "updated_at": now},
                "$push": {"status_history": history_entry},
            },
        )

        if result.modified_count == 0:
            return {"success": False, "message": "Failed to update order"}

        return {
            "success": True,
            "order_id": order_id,
            "previous_status": previous_status,
            "new_status": status,
            "updated_at": now,
        }
