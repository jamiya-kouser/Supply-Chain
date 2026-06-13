from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class OrderItemModel(BaseModel):
    sku: str
    product_name: Optional[str] = None
    quantity: int
    unit_price: Optional[float] = None
    total_price: Optional[float] = None


class StatusHistoryEntry(BaseModel):
    status: str
    timestamp: str
    user: Optional[str] = None


class OrderModel(BaseModel):
    order_id: Optional[str] = None
    type: str = "purchase_order"
    supplier_id: str
    supplier_name: Optional[str] = None
    status: str = "pending_confirmation"
    items: List[OrderItemModel] = []
    total_value: Optional[float] = None
    currency: str = "INR"
    delivery_warehouse: str
    requested_delivery_date: Optional[str] = None
    actual_delivery_date: Optional[str] = None
    notes: Optional[str] = None
    status_history: List[StatusHistoryEntry] = []
    created_by: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


class CreateOrderRequest(BaseModel):
    supplier_id: str
    items: List[OrderItemModel]
    delivery_warehouse: str
    requested_delivery_date: Optional[str] = None
    notes: Optional[str] = None
