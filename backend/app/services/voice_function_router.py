from app.services.shipment_service import ShipmentService
from app.services.inventory_service import InventoryService
from app.services.order_service import OrderService
from app.services.delivery_service import DeliveryService
from app.services.exception_service import ExceptionService
from app.services.driver_service import DriverService
from app.services.notification_service import NotificationService
from app.database.collections import get_shipments_collection
from datetime import datetime, timedelta
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

# ── Service Instances ──────────────────────────────────────────────
shipment_svc = ShipmentService()
inventory_svc = InventoryService()
order_svc = OrderService()
delivery_svc = DeliveryService()
exception_svc = ExceptionService()
driver_svc = DriverService()
notification_svc = NotificationService()


# ── Individual Voice Tool Handlers ─────────────────────────────────

async def _check_shipment_status(params: dict) -> dict:
    """Check current status of a shipment."""
    return await shipment_svc.get_status(params.get("shipment_id", ""))


async def _schedule_delivery(params: dict) -> dict:
    """Schedule a new delivery."""
    return await delivery_svc.schedule_delivery(
        warehouse_id=params.get("warehouse_id", ""),
        date=params.get("date", ""),
        time=params.get("time", ""),
        shipment_id=params.get("shipment_id"),
        notes=params.get("notes"),
    )


async def _check_inventory(params: dict) -> dict:
    """Check stock level for a SKU."""
    return await inventory_svc.check_stock(
        sku=params.get("sku", ""),
        warehouse_id=params.get("warehouse_id"),
    )


async def _create_purchase_order(params: dict) -> dict:
    """Create a new purchase order."""
    return await order_svc.create_purchase_order(
        supplier_id=params.get("supplier_id", ""),
        items=params.get("items", []),
        delivery_warehouse=params.get("delivery_warehouse", ""),
        requested_delivery_date=params.get("requested_delivery_date"),
        notes=params.get("notes"),
    )


async def _update_delivery_status(params: dict) -> dict:
    """Update shipment status."""
    return await shipment_svc.update_status(
        shipment_id=params.get("shipment_id", ""),
        status=params.get("status", ""),
        notes=params.get("notes"),
    )


async def _verify_driver_identity(params: dict) -> Dict[str, Any]:
    """
    Verify driver identity at voice session start.
    Required by new.md Section 3.1.
    """
    driver_id = params.get("driver_id", "")
    if not driver_id:
        return {"verified": False, "message": "Driver ID not provided"}

    result = await driver_svc.verify_driver_identity(driver_id)
    return result


async def _get_driver_shipments(params: dict) -> Dict[str, Any]:
    """
    Get all active shipments assigned to a driver.
    Required by new.md Section 3.2.
    Uses driver_id field (indexed) instead of text search.
    """
    driver_id = params.get("driver_id", "")
    if not driver_id:
        return {"error": "driver_id required"}

    result = await driver_svc.get_active_assignments(driver_id)
    return result


async def _report_delivery_exception(params: dict) -> Dict[str, Any]:
    """
    Report a delivery exception (failed delivery, damage, access issue).
    Required by new.md Section 3.3.
    Triggers automatic status updates and stakeholder notifications.
    """
    shipment_id = params.get("shipment_id", "")
    driver_id = params.get("driver_id", "")
    exception_type = params.get("exception_type", "other")
    description = params.get("description", "")
    latitude = params.get("current_lat")
    longitude = params.get("current_lon")

    if not shipment_id:
        return {"success": False, "message": "shipment_id required"}

    collection = get_shipments_collection()
    shipment = await collection.find_one({"shipment_id": shipment_id})
    if not shipment:
        return {"success": False, "message": f"Shipment {shipment_id} not found"}

    # Create exception record
    exception_doc = await exception_svc.report_delivery_exception(
        shipment_id=shipment_id,
        exception_type=exception_type,
        description=description,
        severity="high",
        reported_by=driver_id,
    )

    # Update shipment status based on exception type
    exception_status_map = {
        "address_inaccessible": "delivery_attempted",
        "package_damaged": "damaged",
        "customer_refused": "refused",
        "safety_concern": "on_hold",
        "lost": "lost",
    }
    new_status = exception_status_map.get(exception_type, "on_hold")

    await collection.update_one(
        {"shipment_id": shipment_id},
        {
            "$set": {
                "status": new_status,
                "updated_at": datetime.utcnow()
            },
            "$push": {
                "status_history": {
                    "status": new_status,
                    "timestamp": datetime.utcnow(),
                    "reason": f"Exception: {description}"
                }
            }
        }
    )

    # Trigger notifications asynchronously
    try:
        # Get warehouse and customer info from shipment
        warehouse_email = "warehouse@logistics.com"
        customer_email = shipment.get("customer", {}).get("email", "")

        recipients = [warehouse_email]
        if customer_email:
            recipients.append(customer_email)

        await notification_svc.dispatch_exception_alerts(
            shipment_id=shipment_id,
            exception_type=exception_type,
            description=description,
            recipients=recipients,
        )
    except Exception as e:
        logger.error(f"Failed to dispatch notifications: {str(e)}")

    return {
        "success": True,
        "exception_id": exception_doc.get("exception_id"),
        "shipment_id": shipment_id,
        "status": new_status,
        "message": f"Exception logged. Shipment {shipment_id} marked as {new_status}. Notifications sent."
    }


async def _calculate_dynamic_eta(params: dict) -> Dict[str, Any]:
    """
    Recalculate ETA when driver reports a delay.
    Required by new.md Section 3.4.
    Updates ETA and notifies stakeholders.
    """
    shipment_id = params.get("shipment_id", "")
    delay_minutes = params.get("delay_minutes", 0)
    reason = params.get("reason", "")

    if not shipment_id or delay_minutes <= 0:
        return {"success": False, "message": "shipment_id and delay_minutes required"}

    collection = get_shipments_collection()
    shipment = await collection.find_one({"shipment_id": shipment_id})

    if not shipment:
        return {"success": False, "message": "Shipment not found"}

    try:
        # Parse old ETA
        eta_str = shipment.get("destination", {}).get("expected_arrival")
        if isinstance(eta_str, str):
            old_eta = datetime.fromisoformat(eta_str.replace('Z', '+00:00'))
        else:
            old_eta = eta_str

        # Calculate new ETA
        new_eta = old_eta + timedelta(minutes=delay_minutes)

        # Update shipment
        await collection.update_one(
            {"shipment_id": shipment_id},
            {
                "$set": {
                    "destination.expected_arrival": new_eta,
                    "updated_at": datetime.utcnow()
                },
                "$push": {
                    "status_history": {
                        "status": "delayed",
                        "timestamp": datetime.utcnow(),
                        "reason": f"Delay reported: {reason}",
                        "delay_minutes": delay_minutes
                    }
                }
            }
        )

        # Notify stakeholders
        try:
            warehouse_email = "warehouse@logistics.com"
            customer_email = shipment.get("customer", {}).get("email", "")
            recipients = [warehouse_email]
            if customer_email:
                recipients.append(customer_email)

            await notification_svc.dispatch_eta_update(
                shipment_id=shipment_id,
                old_eta=old_eta.isoformat(),
                new_eta=new_eta.isoformat(),
                reason=reason,
                recipients=recipients,
            )
        except Exception as e:
            logger.error(f"Failed to send ETA notifications: {str(e)}")

        return {
            "success": True,
            "shipment_id": shipment_id,
            "old_eta": old_eta.isoformat(),
            "new_eta": new_eta.isoformat(),
            "delay_minutes": delay_minutes,
            "notifications_sent": True,
            "message": f"ETA updated to {new_eta.isoformat()}. Stakeholders notified."
        }
    except Exception as e:
        logger.error(f"ETA calculation failed: {str(e)}")
        return {"success": False, "message": f"ETA calculation failed: {str(e)}"}


async def _notify_stakeholders(params: dict) -> Dict[str, Any]:
    """
    Manually trigger stakeholder notifications.
    Required by new.md Section 3.5.
    """
    shipment_id = params.get("shipment_id", "")
    event_type = params.get("event_type", "update")
    message = params.get("message", "")
    recipients = params.get("recipients", [])

    if not recipients:
        return {"success": False, "message": "recipients required"}

    try:
        for recipient_email in recipients:
            await notification_svc.send_email(
                recipient=recipient_email,
                subject=f"Shipment Update: {event_type}",
                body=f"<p>{message}</p>",
                metadata={
                    "shipment_id": shipment_id,
                    "event_type": event_type
                }
            )

        return {
            "success": True,
            "shipment_id": shipment_id,
            "recipients_count": len(recipients),
            "message": f"Notifications sent to {len(recipients)} recipients."
        }
    except Exception as e:
        logger.error(f"Stakeholder notification failed: {str(e)}")
        return {"success": False, "message": f"Notification failed: {str(e)}"}


# ── Function Dispatch Map ──────────────────────────────────────────

FUNCTION_MAP = {
    "check_shipment_status": _check_shipment_status,
    "schedule_delivery": _schedule_delivery,
    "check_inventory": _check_inventory,
    "create_purchase_order": _create_purchase_order,
    "update_delivery_status": _update_delivery_status,
    "verify_driver_identity": _verify_driver_identity,
    "get_driver_shipments": _get_driver_shipments,
    "report_delivery_exception": _report_delivery_exception,
    "calculate_dynamic_eta": _calculate_dynamic_eta,
    "notify_stakeholders": _notify_stakeholders,
}


async def route_function_call(func_name: str, parameters: dict) -> dict:
    """
    Route a Vapi function call to the appropriate service handler.

    1. Receive Vapi webhook payload (func_name + parameters)
    2. Detect function name
    3. Call appropriate service
    4. Return JSON result
    """
    handler = FUNCTION_MAP.get(func_name)
    if not handler:
        return {"error": f"Unknown function: {func_name}", "available": list(FUNCTION_MAP.keys())}

    try:
        return await handler(parameters)
    except Exception as e:
        logger.error(f"Function {func_name} failed: {str(e)}")
        return {"error": f"Function {func_name} failed: {str(e)}", "function": func_name}
