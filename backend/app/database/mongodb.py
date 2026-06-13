"""
MongoDB connection manager using Motor (async driver).
Handles connect/disconnect lifecycle and exposes the database instance.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None
_database: AsyncIOMotorDatabase | None = None


async def connect_db() -> None:
    """Initialize the MongoDB connection using Motor async driver."""
    global _client, _database
    settings = get_settings()
    _client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        serverSelectionTimeoutMS=3000,
    )
    _database = _client[settings.MONGODB_DB_NAME]
    # Verify connectivity (non-fatal — server starts regardless)
    try:
        await _client.admin.command("ping")
        logger.info("✅ Connected to MongoDB: %s", settings.MONGODB_DB_NAME)
    except Exception as e:
        logger.warning("⚠️  MongoDB not reachable (%s). Server started without DB.", e)


async def close_db() -> None:
    """Close the MongoDB connection."""
    global _client, _database
    if _client:
        _client.close()
        _client = None
        _database = None
        logger.info("🔌 MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Return the active database instance."""
    if _database is None:
        raise RuntimeError("Database not initialized. Call connect_db() first.")
    return _database
