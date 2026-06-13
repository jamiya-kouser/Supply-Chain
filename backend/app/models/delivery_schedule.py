from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class DeliveryScheduleModel(BaseModel):
    schedule_id: Optional[str] = None
    warehouse_id: str
    warehouse_name: Optional[str] = None
    shipment_id: Optional[str] = None
    scheduled_date: str
    scheduled_time: str
    duration_hours: float = 2.0
    dock_assignment: Optional[str] = None
    status: str = "confirmed"
    assigned_staff: List[str] = []
    equipment_needed: List[str] = []
    notes: Optional[str] = None
    created_by: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


class CreateDeliveryScheduleRequest(BaseModel):
    warehouse_id: str
    shipment_id: Optional[str] = None
    requested_date: str
    requested_time: str
    duration_hours: float = 2.0
    notes: Optional[str] = None


class RescheduleDeliveryRequest(BaseModel):
    new_date: Optional[str] = None
    new_time: Optional[str] = None
    reason: Optional[str] = None
