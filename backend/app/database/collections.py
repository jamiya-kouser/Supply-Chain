"""
Typed accessors for MongoDB collections.
Centralises collection names so they are defined in one place.
"""

from motor.motor_asyncio import AsyncIOMotorCollection
from app.database.mongodb import get_database


def get_drivers_collection() -> AsyncIOMotorCollection:
    """Return the `drivers` collection."""
    return get_database()["drivers"]


def get_notifications_collection() -> AsyncIOMotorCollection:
    """Return the `notifications_log` collection."""
    return get_database()["notifications_log"]


def get_shipments_collection() -> AsyncIOMotorCollection:
    """Return the `shipments` collection."""
    return get_database()["shipments"]


def get_inventory_collection() -> AsyncIOMotorCollection:
    """Return the `inventory` collection."""
    return get_database()["inventory"]


def get_orders_collection() -> AsyncIOMotorCollection:
    """Return the `orders` collection."""
    return get_database()["orders"]


def get_delivery_schedules_collection() -> AsyncIOMotorCollection:
    """Return the `delivery_schedules` collection."""
    return get_database()["delivery_schedules"]


def get_users_collection() -> AsyncIOMotorCollection:
    """Return the `users` collection."""
    return get_database()["users"]


def get_delivery_exceptions_collection() -> AsyncIOMotorCollection:
    """Return the `delivery_exceptions` collection."""
    return get_database()["delivery_exceptions"]
