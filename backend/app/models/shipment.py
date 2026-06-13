from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class LocationModel(BaseModel):
    city: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    updated_at: Optional[str] = None


class OriginDestinationModel(BaseModel):
    warehouse_id: str
    warehouse_name: Optional[str] = None
    city: str
    state: Optional[str] = None
    departed_at: Optional[str] = None
    expected_arrival: Optional[str] = None


class CarrierModel(BaseModel):
    name: str
    tracking_number: Optional[str] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None


class ShipmentItemModel(BaseModel):
    sku: str
    product_name: str
    quantity: int
    weight_kg: Optional[float] = None


class StatusHistoryEntry(BaseModel):
    status: str
    timestamp: str
    note: Optional[str] = None


class ShipmentModel(BaseModel):
    shipment_id: str
    status: str = "created"
    origin: OriginDestinationModel
    destination: OriginDestinationModel
    current_location: Optional[LocationModel] = None
    carrier: Optional[CarrierModel] = None
    items: List[ShipmentItemModel] = []
    total_weight_kg: Optional[float] = None
    total_items: Optional[int] = None
    order_id: Optional[str] = None
    priority: str = "normal"
    status_history: List[StatusHistoryEntry] = []
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


class ShipmentStatusUpdate(BaseModel):
    status: str
    delivery_timestamp: Optional[str] = None
    received_by: Optional[str] = None
    notes: Optional[str] = None
