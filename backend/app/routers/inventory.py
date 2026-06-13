from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.inventory_service import InventoryService
from app.models.inventory import InventoryUpdateModel

router = APIRouter()
inventory_service = InventoryService()


@router.get("/")
async def list_inventory(
    warehouse_id: Optional[str] = Query(None, description="Filter by warehouse"),
    category: Optional[str] = Query(None, description="Filter by category"),
    low_stock: bool = Query(False, description="Show only low stock items"),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
):
    """List inventory items with optional filters."""
    items = await inventory_service.get_all_inventory(
        warehouse_id=warehouse_id,
        category=category,
        low_stock_only=low_stock,
        limit=limit,
        skip=skip,
    )
    return {"inventory": items, "count": len(items)}


@router.get("/{sku}")
async def get_inventory_by_sku(
    sku: str,
    warehouse_id: Optional[str] = Query(None, description="Specific warehouse"),
):
    """Check inventory for a specific SKU."""
    result = await inventory_service.check_stock(sku, warehouse_id)
    if not result.get("found"):
        raise HTTPException(status_code=404, detail=result.get("message", "SKU not found"))
    return result


@router.put("/{sku}")
async def update_inventory(sku: str, body: InventoryUpdateModel):
    """Update inventory for a specific SKU."""
    update_data = body.model_dump(exclude_none=True)
    result = await inventory_service.update_inventory(sku, update_data)
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("message", "Update failed"))
    return result
