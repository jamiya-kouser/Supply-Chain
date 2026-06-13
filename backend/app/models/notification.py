"""
Pydantic models for the Notification system.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class NotificationType(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    EXCEPTION_ALERT = "exception_alert"
    ETA_UPDATE = "eta_update"
    SHIPMENT_DELAYED = "shipment_delayed"


class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"


class Recipient(BaseModel):
    """Notification recipient info."""
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    role: str  # "customer", "warehouse_manager", "driver", etc.


class NotificationLog(BaseModel):
    """Document stored in the `notifications_log` collection."""
    notification_id: Optional[str] = None
    type: NotificationType
    shipment_id: Optional[str] = None
    status: NotificationStatus = NotificationStatus.PENDING
    trigger_event: str  # "driver_reported_delay", "exception_logged", etc.
    recipients: List[Recipient] = Field(default_factory=list)
    message: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    error: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    sent_at: Optional[datetime] = None


class NotificationRequest(BaseModel):
    """Incoming notification request."""
    recipient: str
    subject: Optional[str] = None
    body: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
