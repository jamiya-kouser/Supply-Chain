"""
Pydantic models for the Driver management system.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class DriverStatus(str, Enum):
    AVAILABLE = "available"
    ON_ROUTE = "on_route"
    OFF_DUTY = "off_duty"
    INACTIVE = "inactive"


class LocationModel(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    address: Optional[str] = None
    updated_at: Optional[datetime] = None


class ShipmentAssignment(BaseModel):
    shipment_id: str
    origin: str
    destination: str
    status: str
    eta: Optional[str] = None
    assigned_at: Optional[datetime] = None


class DriverBase(BaseModel):
    driver_id: str
    name: str
    phone: str
    email: Optional[str] = None
    license_number: str
    vehicle_number: Optional[str] = None
    status: DriverStatus = DriverStatus.AVAILABLE
    current_location: Optional[LocationModel] = None
    assigned_shipments: List[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class DriverResponse(DriverBase):
    """Returned from API — excludes Mongo _id."""

    class Config:
        from_attributes = True


class DriverLocationUpdate(BaseModel):
    """Request body for PATCH /api/drivers/{driver_id}/location"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    address: Optional[str] = None


class DriverVerifyRequest(BaseModel):
    """Query params for driver verification."""
    driver_id: Optional[str] = None
    phone: Optional[str] = None
    license_number: Optional[str] = None


class DriverVerifyResponse(BaseModel):
    verified: bool
    driver: Optional[DriverResponse] = None
    message: str = ""
