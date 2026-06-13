"""
Seed MongoDB with dummy data.

Usage:
    python seed_db.py

This script reads dummy_data.json and inserts it into the MongoDB database.
It clears existing collections first to avoid duplicates.
"""

import asyncio
import json
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings
from app.database.collections import (
    get_drivers_collection,
    get_shipments_collection,
    get_delivery_exceptions_collection,
    get_notifications_collection,
)

# ── Logging ──────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


async def seed_database():
    """Load and insert dummy data into MongoDB."""
    settings = get_settings()
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
    db = client[settings.MONGODB_DB_NAME]
    
    try:
        # Read dummy data
        with open("dummy_data.json", "r") as f:
            data = json.load(f)
        
        logger.info("📂 Loaded dummy_data.json")
        
        # ── Seed Drivers ──────────────────────────────────────────
        if "drivers" in data:
            drivers_coll = db["drivers"]
            
            # Clear existing data
            await drivers_coll.delete_many({})
            logger.info("🗑️  Cleared drivers collection")
            
            # Insert new data
            result = await drivers_coll.insert_many(data["drivers"])
            logger.info(f"✅ Inserted {len(result.inserted_ids)} drivers")
        
        # ── Seed Shipments ────────────────────────────────────────
        if "shipments" in data:
            shipments_coll = db["shipments"]
            
            # Clear existing data
            await shipments_coll.delete_many({})
            logger.info("🗑️  Cleared shipments collection")
            
            # Insert new data
            result = await shipments_coll.insert_many(data["shipments"])
            logger.info(f"✅ Inserted {len(result.inserted_ids)} shipments")        
        # ── Seed Orders ───────────────────────────────────────
        if "orders" in data:
            orders_coll = db["orders"]
            
            # Clear existing data
            await orders_coll.delete_many({})
            logger.info("🗑️  Cleared orders collection")
            
            # Insert new data
            result = await orders_coll.insert_many(data["orders"])
            logger.info(f"✅ Inserted {len(result.inserted_ids)} orders")
        
        # ── Seed Inventory ────────────────────────────────────
        if "inventory" in data:
            inventory_coll = db["inventory"]
            
            # Clear existing data
            await inventory_coll.delete_many({})
            logger.info("🗑️  Cleared inventory collection")
            
            # Insert new data
            result = await inventory_coll.insert_many(data["inventory"])
            logger.info(f"✅ Inserted {len(result.inserted_ids)} inventory items")        
        # ── Seed Delivery Exceptions ──────────────────────────────
        if "exceptions" in data:
            exceptions_coll = db["delivery_exceptions"]
            
            # Clear existing data
            await exceptions_coll.delete_many({})
            logger.info("🗑️  Cleared delivery_exceptions collection")
            
            # Insert new data
            result = await exceptions_coll.insert_many(data["exceptions"])
            logger.info(f"✅ Inserted {len(result.inserted_ids)} delivery exceptions")
        
        # ── Seed Notifications ────────────────────────────────────
        if "notifications_log" in data:
            notifications_coll = db["notifications_log"]
            
            # Clear existing data
            await notifications_coll.delete_many({})
            logger.info("🗑️  Cleared notifications_log collection")
            
            # Insert new data
            result = await notifications_coll.insert_many(data["notifications_log"])
            logger.info(f"✅ Inserted {len(result.inserted_ids)} notifications")        
        # ── Seed Delivery Schedules ────────────────────────────
        if "delivery_schedules" in data:
            schedules_coll = db["delivery_schedules"]
            
            # Clear existing data
            await schedules_coll.delete_many({})
            logger.info("🗑️  Cleared delivery_schedules collection")
            
            # Insert new data
            result = await schedules_coll.insert_many(data["delivery_schedules"])
            logger.info(f"✅ Inserted {len(result.inserted_ids)} delivery schedules")        
        logger.info("\n" + "="*80)
        logger.info("🎉 Database seeding complete!")
        logger.info("="*80 + "\n")
        
    except FileNotFoundError:
        logger.error("❌ dummy_data.json not found. Make sure you're in the backend directory.")
    except Exception as e:
        logger.error(f"❌ Error seeding database: {e}")
    finally:
        client.close()
        logger.info("Database connection closed")


if __name__ == "__main__":
    asyncio.run(seed_database())
