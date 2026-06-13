from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.shipment_service import ShipmentService
from app.models.shipment import ShipmentStatusUpdate

router = APIRouter()
shipment_service = ShipmentService()


@router.get("/")
async def list_shipments(
    status: Optional[str] = Query(None, description="Filter by status"),
    carrier: Optional[str] = Query(None, description="Filter by carrier name"),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
):
    """List all shipments with optional filters."""
    shipments = await shipment_service.get_all_shipments(
        status=status, carrier=carrier, limit=limit, skip=skip
    )
    return {"shipments": shipments, "count": len(shipments)}


@router.get("/{shipment_id}")
async def get_shipment(shipment_id: str):
    """Get a specific shipment by ID."""
    result = await shipment_service.get_status(shipment_id)
    if not result.get("found"):
        raise HTTPException(status_code=404, detail=result.get("message", "Shipment not found"))
    return result


@router.patch("/{shipment_id}/status")
async def update_shipment_status(shipment_id: str, body: ShipmentStatusUpdate):
    """Update the status of a shipment."""
    result = await shipment_service.update_status(
        shipment_id=shipment_id,
        status=body.status,
        notes=body.notes,
        delivery_timestamp=body.delivery_timestamp,
        received_by=body.received_by,
    )
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("message", "Update failed"))
    return result
