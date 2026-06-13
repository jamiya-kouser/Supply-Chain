from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.delivery_service import DeliveryService
from app.models.delivery_schedule import (
    CreateDeliveryScheduleRequest,
    RescheduleDeliveryRequest,
)

router = APIRouter()
delivery_service = DeliveryService()


@router.post("/", status_code=201)
async def create_delivery_schedule(body: CreateDeliveryScheduleRequest):
    """Schedule a new delivery at a warehouse."""
    result = await delivery_service.schedule_delivery(
        warehouse_id=body.warehouse_id,
        date=body.requested_date,
        time=body.requested_time,
        shipment_id=body.shipment_id,
        duration_hours=body.duration_hours,
        notes=body.notes,
    )
    if not result.get("success"):
        raise HTTPException(status_code=409, detail=result.get("message", "Scheduling conflict"))
    return result


@router.get("/")
async def list_delivery_schedules(
    warehouse_id: Optional[str] = Query(None, description="Filter by warehouse"),
    status: Optional[str] = Query(None, description="Filter by status"),
    date: Optional[str] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
):
    """List delivery schedules with optional filters."""
    schedules = await delivery_service.get_all_schedules(
        warehouse_id=warehouse_id, status=status, date=date, limit=limit, skip=skip
    )
    return {"schedules": schedules, "count": len(schedules)}


@router.patch("/{schedule_id}")
async def reschedule_delivery(schedule_id: str, body: RescheduleDeliveryRequest):
    """Reschedule an existing delivery."""
    result = await delivery_service.reschedule_delivery(
        schedule_id=schedule_id,
        new_date=body.new_date,
        new_time=body.new_time,
        reason=body.reason,
    )
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("message", "Schedule not found"))
    return result
