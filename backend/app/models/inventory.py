from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class WarehouseLocationModel(BaseModel):
    aisle: Optional[str] = None
    rack: Optional[str] = None
    shelf: Optional[str] = None


class InventoryModel(BaseModel):
    sku: str
    product_name: str
    category: Optional[str] = None
    warehouse_id: str
    warehouse_name: Optional[str] = None
    quantity: int = 0
    unit: str = "pieces"
    reorder_threshold: int = 100
    reorder_quantity: int = 500
    unit_price: Optional[float] = None
    currency: str = "INR"
    location_in_warehouse: Optional[WarehouseLocationModel] = None
    supplier_id: Optional[str] = None
    last_restocked: Optional[str] = None
    last_audited: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


class InventoryUpdateModel(BaseModel):
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    reorder_threshold: Optional[int] = None
    reorder_quantity: Optional[int] = None
    location_in_warehouse: Optional[WarehouseLocationModel] = None
    notes: Optional[str] = None
