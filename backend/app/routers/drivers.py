"""
Driver management REST endpoints.

Endpoints:
  GET    /api/drivers                        — list all drivers
  GET    /api/drivers/verify                 — verify driver identity
  GET    /api/drivers/{driver_id}/assignments — get driver shipments
  PATCH  /api/drivers/{driver_id}/location   — update driver location
"""

from fastapi import APIRouter, Query, HTTPException, status
from typing import Optional

from app.services.driver_service import driver_service
from app.models.driver import (
    DriverLocationUpdate,
    DriverResponse,
    DriverVerifyResponse,
)

router = APIRouter()


@router.get("", summary="List all drivers")
async def list_drivers(
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    """Return a paginated list of drivers, optionally filtered by status."""
    drivers = await driver_service.get_all_drivers(
        status=status_filter, skip=skip, limit=limit
    )
    return {"drivers": drivers, "count": len(drivers)}


@router.get("/verify", response_model=DriverVerifyResponse, summary="Verify driver identity")
async def verify_driver(
    driver_id: Optional[str] = Query(None),
):
    """Verify a driver using driver_id or vehicle_number."""
    if not driver_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="driver_id query parameter is required"
        )
    result = await driver_service.verify_driver_identity(driver_id)
    if not result.get("verified"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message", "Driver not found")
        )
    return result


@router.get("/{driver_id}/assignments", summary="Get driver shipment assignments")
async def get_driver_assignments(driver_id: str):
    """Return the shipment assignments for a specific driver."""
    result = await driver_service.get_driver_shipments(driver_id)
    if not result.get("shipments"):
        # Check if driver exists
        driver = await driver_service.get_driver_by_id(driver_id)
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Driver {driver_id} not found",
            )
    return result


@router.patch("/{driver_id}/location", summary="Update driver location")
async def update_driver_location(driver_id: str, body: DriverLocationUpdate):
    """Update the real-time GPS location of a driver."""
    result = await driver_service.update_driver_location(
        driver_id=driver_id,
        latitude=body.latitude,
        longitude=body.longitude,
        address=body.address,
    )
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message", "Driver not found"),
        )
    return result
