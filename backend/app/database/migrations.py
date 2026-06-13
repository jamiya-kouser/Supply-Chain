"""
Database migrations and index setup.

Creates indexes for critical query paths to optimize performance.
Per new.md Section 4.3: Add database indexes for critical query paths.
"""

import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.database.collections import (
    get_drivers_collection,
    get_shipments_collection,
    get_delivery_exceptions_collection,
    get_notifications_collection,
)

logger = logging.getLogger(__name__)


async def setup_indexes():
    """
    Create all necessary indexes for optimized query performance.
    Called on application startup from main.py.
    """
    try:
        # ── Drivers collection indexes ────────────────────────────
        drivers_coll = get_drivers_collection()
        
        # Unique indexes
        await drivers_coll.create_index("driver_id", unique=True)
        await drivers_coll.create_index("phone", unique=True, sparse=True)
        await drivers_coll.create_index("email", unique=True, sparse=True)
        
        # Non-unique indexes for queries
        await drivers_coll.create_index("status")
        await drivers_coll.create_index("assigned_region")
        await drivers_coll.create_index([("current_location.latitude", 1), ("current_location.longitude", 1)])
        
        logger.info("✅  Drivers collection indexes created")
        
        
        # ── Shipments collection indexes ─────────────────────────
        shipments_coll = get_shipments_collection()
        
        # Unique index
        await shipments_coll.create_index("shipment_id", unique=True)
        
        # Driver lookup index (critical for voice agent)
        await shipments_coll.create_index("carrier.driver_id")
        
        # Status queries
        await shipments_coll.create_index("status")
        
        # ETA sorting (for proactive briefing)
        await shipments_coll.create_index([
            ("carrier.driver_id", 1),
            ("destination.expected_arrival", 1)
        ])
        
        # Status + timestamp compound index
        await shipments_coll.create_index([
            ("status", 1),
            ("created_at", -1)
        ])
        
        logger.info("✅  Shipments collection indexes created")
        
        
        # ── Delivery Exceptions collection indexes ─────────────────
        exceptions_coll = get_delivery_exceptions_collection()
        
        # Unique index
        await exceptions_coll.create_index("exception_id", unique=True)
        
        # Query indexes
        await exceptions_coll.create_index("shipment_id")
        await exceptions_coll.create_index("driver_id")
        await exceptions_coll.create_index("status")
        
        # Compound indexes for filtered queries
        await exceptions_coll.create_index([
            ("status", 1),
            ("created_at", -1)
        ])
        
        await exceptions_coll.create_index([
            ("shipment_id", 1),
            ("status", 1)
        ])
        
        # TTL index for automatic cleanup (optional, 90 days)
        await exceptions_coll.create_index(
            "resolved_at",
            expireAfterSeconds=7776000,  # 90 days
            sparse=True
        )
        
        logger.info("✅  Delivery Exceptions collection indexes created")
        
        
        # ── Notifications collection indexes ────────────────────────
        notifications_coll = get_notifications_collection()
        
        # Unique index
        await notifications_coll.create_index("notification_id", unique=True)
        
        # Query indexes
        await notifications_coll.create_index("shipment_id")
        await notifications_coll.create_index([("created_at", -1)])
        
        # TTL index for automatic cleanup (30 days)
        await notifications_coll.create_index(
            "created_at",
            expireAfterSeconds=2592000  # 30 days
        )
        
        logger.info("✅  Notifications collection indexes created")
        
        logger.info("🎯  All database indexes initialized successfully")
        return True
        
    except Exception as e:
        logger.error("❌  Error setting up indexes: %s", str(e))
        raise


async def drop_all_indexes():
    """
    Drop all indexes (for testing/reset purposes).
    Use with caution in production!
    """
    try:
        for coll_name, get_coll in [
            ("drivers", get_drivers_collection),
            ("shipments", get_shipments_collection),
            ("delivery_exceptions", get_delivery_exceptions_collection),
            ("notifications_log", get_notifications_collection),
        ]:
            await get_coll().drop_indexes()
            logger.warning("Dropped all indexes on %s collection", coll_name)
    except Exception as e:
        logger.error("Error dropping indexes: %s", str(e))
        raise
