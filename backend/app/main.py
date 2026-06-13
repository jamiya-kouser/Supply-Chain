"""
FastAPI application entry point.

• Registers all routers (drivers, websocket, shipments, inventory, etc.)
• Configures CORS middleware
• Adds JWT-verification middleware
• Wires startup / shutdown lifecycle to MongoDB
• Includes LLM warm-up on startup per new.md Section 6.2
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
import logging
import asyncio

from app.config import get_settings
from app.database.mongodb import connect_db, close_db
from app.database.migrations import setup_indexes
from app.websocket.manager import ws_manager
from app.routers import websocket as ws_router
from app.routers import drivers as driver_router
from app.routers import auth as auth_router
from app.routers import (
    shipments,
    inventory,
    orders,
    delivery_schedules,
    exceptions,
    voice_agent,
)

# ── Logging ──────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()


# ── Lifespan (startup + shutdown) ────────────────────────
async def warm_up_llms():
    """
    Pre-warm LLMs on startup to reduce cold-start latency.
    Per new.md Section 6.2: Startup should invoke voice_agent with dummy state
    to ensure 8B and 70B models are loaded and ready for <1.5s TTFT.
    """
    try:
        from app.agent.graph import voice_agent
        from app.agent.state import VoiceAgentState
        
        logger.info("🔥  Warming up LLMs...")
        
        # Create dummy state for warm-up
        dummy_state: VoiceAgentState = {
            "messages": [],
            "transcript": "Test warm-up",
            "intent": None,
            "tool_results": [],
            "response_text": None,
            "error": None,
            "needs_clarification": False,
            "driver_id": None,
            "driver_name": None,
            "assigned_shipments": [],
            "is_driver_session": False,
            "exception_context": None,
        }
        
        # Invoke agent to warm up models
        # This will trigger both 8B (intent) and 70B (response) model loads
        result = await asyncio.to_thread(voice_agent.ainvoke, dummy_state)
        
        logger.info("✅  LLM warm-up complete. Agent ready.")
        return True
    except Exception as e:
        logger.warning("⚠️   LLM warm-up failed (non-blocking): %s", str(e))
        return False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Connect to MongoDB on startup, close on shutdown."""
    await connect_db()
    logger.info("🚀  %s v%s is ready", settings.APP_NAME, settings.APP_VERSION)
    
    # Set up database indexes for critical query paths
    try:
        await setup_indexes()
    except Exception as e:
        logger.error("⚠️   Index setup failed (non-blocking): %s", str(e))
    
    # Warm up LLMs asynchronously (non-blocking startup)
    asyncio.create_task(warm_up_llms())
    
    yield
    await close_db()
    logger.info("👋  Application shut down cleanly.")


# ── App instance ─────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Autonomous AI Voice Agent backend for Supply Chain Management",
    lifespan=lifespan,
)


# ── CORS ─────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── JWT Authentication Middleware ────────────────────────
_PUBLIC_PATHS: set[str] = {
    "/",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/health",
    "/auth/generate-token",
}
_PUBLIC_PREFIXES: tuple[str, ...] = ("/ws/",)


@app.middleware("http")
async def jwt_auth_middleware(request: Request, call_next):
    """
    Lightweight JWT verification middleware.
    Skips public routes and WebSocket upgrades.
    """
    path = request.url.path

    if path in _PUBLIC_PATHS or path.startswith(_PUBLIC_PREFIXES):
        return await call_next(request)

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Missing or invalid Authorization header"},
        )

    token = auth_header.split(" ", 1)[1]

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        request.state.user = payload
    except JWTError:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Invalid or expired token"},
        )

    return await call_next(request)


# ── Routers ──────────────────────────────────────────────
app.include_router(ws_router.router, prefix="/ws", tags=["WebSocket"])
app.include_router(auth_router.router, prefix="/auth", tags=["Authentication"])
app.include_router(driver_router.router, prefix="/api/drivers", tags=["Drivers"])
app.include_router(shipments.router, prefix="/api/shipments", tags=["Shipments"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(
    delivery_schedules.router,
    prefix="/api/delivery-schedules",
    tags=["Delivery Schedules"],
)
app.include_router(exceptions.router, prefix="/api/exceptions", tags=["Exceptions"])
app.include_router(voice_agent.router, prefix="/vapi", tags=["Voice Agent"])


# ── WebSocket: Real-Time Dispatch ────────────────────────
@app.websocket("/ws/dispatch")
async def websocket_dispatch(websocket: WebSocket):
    """Real-time event channel for dispatch operations."""
    await ws_manager.connect("dispatch", websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "ack", "data": data})
    except WebSocketDisconnect:
        ws_manager.disconnect("dispatch", websocket)


# ── Health check ─────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {"service": settings.APP_NAME, "version": settings.APP_VERSION, "status": "ok"}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}
