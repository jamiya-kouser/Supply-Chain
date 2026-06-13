from datetime import datetime, timezone
from typing import Optional


def driver_location_update(
    shipment_id: str,
    driver_name: str,
    latitude: float,
    longitude: float,
    city: str,
) -> dict:
    """Build a driver_location_update event payload."""
    return {
        "event": "driver_location_update",
        "data": {
            "shipment_id": shipment_id,
            "driver_name": driver_name,
            "latitude": latitude,
            "longitude": longitude,
            "city": city,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    }


def delivery_completed(
    shipment_id: str,
    received_by: str,
    notes: Optional[str] = None,
) -> dict:
    """Build a delivery_completed event payload."""
    return {
        "event": "delivery_completed",
        "data": {
            "shipment_id": shipment_id,
            "received_by": received_by,
            "notes": notes,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    }


def delivery_exception_event(
    exception_id: str,
    shipment_id: str,
    exception_type: str,
    description: str,
) -> dict:
    """Build a delivery_exception event payload."""
    return {
        "event": "delivery_exception",
        "data": {
            "exception_id": exception_id,
            "shipment_id": shipment_id,
            "exception_type": exception_type,
            "description": description,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    }


def eta_update(
    shipment_id: str,
    old_eta: str,
    new_eta: str,
    reason: Optional[str] = None,
) -> dict:
    """Build an eta_update event payload."""
    return {
        "event": "eta_update",
        "data": {
            "shipment_id": shipment_id,
            "old_eta": old_eta,
            "new_eta": new_eta,
            "reason": reason,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    }
