from fastapi import APIRouter, Request, HTTPException
from app.services.voice_function_router import route_function_call
import json
import hmac
import hashlib
import os


router = APIRouter()

# Vapi webhook signature secret (should be stored in environment)
VAPI_SIGNATURE_SECRET = os.getenv("VAPI_SIGNATURE_SECRET", "")


def verify_vapi_signature(request_body: bytes, signature_header: str) -> bool:
    """
    Verify HMAC-SHA256 signature from Vapi webhook.
    
    Signature format: "sha256=<hex_digest>"
    Per new.md Section 6.1: Webhook Signature Verification
    """
    if not VAPI_SIGNATURE_SECRET:
        # Skip verification if secret not configured (development mode)
        return True
    
    if not signature_header:
        return False
    
    # Calculate expected signature
    expected_signature = hmac.new(
        VAPI_SIGNATURE_SECRET.encode(),
        request_body,
        hashlib.sha256
    ).hexdigest()
    
    # Extract signature from header (format: "sha256=<hex>")
    try:
        parts = signature_header.split("=")
        if len(parts) != 2 or parts[0] != "sha256":
            return False
        provided_signature = parts[1]
    except Exception:
        return False
    
    # Constant-time comparison to prevent timing attacks
    return hmac.compare_digest(expected_signature, provided_signature)


@router.post("/function-call")
async def handle_vapi_function_call(request: Request):
    """
    Webhook endpoint called by Vapi when the LLM decides
    to execute a function. Routes to the appropriate service.
    
    Per new.md Section 6.1:
    - Verifies HMAC-SHA256 signature from X-Vapi-Signature header
    - Routes function call to appropriate handler
    - Returns JSON result to Vapi

    Expected payload:
    {
      "message": {
        "type": "function-call",
        "functionCall": {
          "name": "verify_driver_identity",
          "parameters": { "driver_id": "D001" }
        }
      }
    }
    """
    # Get request body for signature verification
    body_bytes = await request.body()
    
    # Verify HMAC signature
    signature_header = request.headers.get("X-Vapi-Signature", "")
    if not verify_vapi_signature(body_bytes, signature_header):
        raise HTTPException(status_code=403, detail="Invalid or missing webhook signature")
    
    # Parse JSON body
    try:
        body = json.loads(body_bytes)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    message = body.get("message", {})
    if message.get("type") != "function-call":
        raise HTTPException(status_code=400, detail="Invalid message type. Expected 'function-call'.")

    function_call = message.get("functionCall", {})
    func_name = function_call.get("name")
    parameters = function_call.get("parameters", {})

    if not func_name:
        raise HTTPException(status_code=400, detail="Missing function name in payload.")

    result = await route_function_call(func_name, parameters)

    return {"result": json.dumps(result)}

