from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class LocationModel(BaseModel):
    """GPS location for exception reporting."""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class ExceptionModel(BaseModel):
    exception_id: Optional[str] = None
    shipment_id: str
    driver_id: Optional[str] = None
    exception_type: str  # e.g. "address_inaccessible", "damaged", "delayed", "lost", "refused", "safety_concern"
    description: str
    severity: str = "medium"  # low, medium, high, critical
    status: str = "open"      # open, investigating, resolved, closed
    location: Optional[LocationModel] = None
    reported_by: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution: Optional[str] = None
    resolved_at: Optional[str] = None
    auto_actions_taken: List[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


class ReportExceptionRequest(BaseModel):
    shipment_id: str
    exception_type: str
    description: str
    severity: str = "medium"
    reported_by: Optional[str] = None


class ResolveExceptionRequest(BaseModel):
    resolution: str
    resolved_by: Optional[str] = None
