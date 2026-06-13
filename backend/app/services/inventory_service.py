from datetime import datetime, timezone
from typing import Optional
from app.database.collections import get_inventory_collection


class InventoryService:
    """Business logic for inventory management."""

    async def get_all_inventory(
        self,
        warehouse_id: Optional[str] = None,
        category: Optional[str] = None,
        low_stock_only: bool = False,
        limit: int = 50,
        skip: int = 0,
    ) -> list[dict]:
        """List inventory items with optional filters."""
        collection = get_inventory_collection()
        query: dict = {}
        if warehouse_id:
            query["warehouse_id"] = warehouse_id
        if category:
            query["category"] = category
        if low_stock_only:
            query["$expr"] = {"$lte": ["$quantity", "$reorder_threshold"]}

        cursor = collection.find(query, {"_id": 0}).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def check_stock(
        self, sku: str, warehouse_id: Optional[str] = None
    ) -> dict:
        """Check stock level for a specific SKU, optionally at a specific warehouse."""
        collection = get_inventory_collection()
        query: dict = {"sku": sku}
        if warehouse_id:
            query["warehouse_id"] = warehouse_id

        item = await collection.find_one(query, {"_id": 0})
        if not item:
            return {
                "found": False,
                "message": f"No inventory record found for SKU {sku}",
            }

        # Determine stock status
        quantity = item.get("quantity", 0)
        threshold = item.get("reorder_threshold", 100)
        if quantity <= 0:
            stock_status = "out_of_stock"
        elif quantity <= threshold:
            stock_status = "low"
        else:
            stock_status = "healthy"

        return {
            "found": True,
            "sku": item["sku"],
            "product_name": item.get("product_name"),
            "warehouse_id": item.get("warehouse_id"),
            "warehouse_name": item.get("warehouse_name"),
            "quantity": quantity,
            "unit": item.get("unit", "pieces"),
            "reorder_threshold": threshold,
            "stock_status": stock_status,
            "last_restocked": item.get("last_restocked"),
            "location_in_warehouse": item.get("location_in_warehouse"),
        }

    async def update_inventory(self, sku: str, update_data: dict) -> dict:
        """Update inventory for a specific SKU."""
        collection = get_inventory_collection()
        now = datetime.now(timezone.utc).isoformat()

        update_fields = {
            k: v for k, v in update_data.items() if v is not None
        }
        update_fields["updated_at"] = now

        result = await collection.update_one(
            {"sku": sku},
            {"$set": update_fields},
        )

        if result.matched_count == 0:
            return {"success": False, "message": f"SKU {sku} not found"}

        return {
            "success": True,
            "sku": sku,
            "updated_fields": list(update_fields.keys()),
            "updated_at": now,
        }

    async def trigger_reorder(self, sku: str, warehouse_id: Optional[str] = None) -> dict:
        """Check if a reorder is needed and flag it."""
        stock = await self.check_stock(sku, warehouse_id)
        if not stock.get("found"):
            return stock

        if stock["stock_status"] in ("low", "out_of_stock"):
            return {
                "reorder_needed": True,
                "sku": sku,
                "current_quantity": stock["quantity"],
                "reorder_threshold": stock["reorder_threshold"],
                "suggested_order_quantity": stock.get("reorder_quantity", 500),
                "message": f"Reorder recommended for SKU {sku}. Current stock: {stock['quantity']}",
            }

        return {
            "reorder_needed": False,
            "sku": sku,
            "current_quantity": stock["quantity"],
            "message": f"Stock level is healthy for SKU {sku}",
        }
