from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.order_service import OrderService
from app.models.order import CreateOrderRequest

router = APIRouter()
order_service = OrderService()


@router.post("/", status_code=201)
async def create_order(body: CreateOrderRequest):
    """Create a new purchase order."""
    items = [item.model_dump() for item in body.items]
    result = await order_service.create_purchase_order(
        supplier_id=body.supplier_id,
        items=items,
        delivery_warehouse=body.delivery_warehouse,
        requested_delivery_date=body.requested_delivery_date,
        notes=body.notes,
    )
    return result


@router.get("/")
async def list_orders(
    status: Optional[str] = Query(None, description="Filter by status"),
    supplier_id: Optional[str] = Query(None, description="Filter by supplier"),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
):
    """List all purchase orders with optional filters."""
    orders = await order_service.get_all_orders(
        status=status, supplier_id=supplier_id, limit=limit, skip=skip
    )
    return {"orders": orders, "count": len(orders)}


@router.get("/{order_id}")
async def get_order(order_id: str):
    """Get details of a specific order."""
    result = await order_service.get_order_details(order_id)
    if not result.get("found"):
        raise HTTPException(status_code=404, detail=result.get("message", "Order not found"))
    return result
