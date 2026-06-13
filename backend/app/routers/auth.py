"""
Authentication endpoints.

Endpoints:
  POST   /auth/generate-token   — generate JWT token for testing/development
"""

from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timedelta, timezone
from jose import jwt
from typing import Optional
from pydantic import BaseModel
import logging

from app.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()

settings = get_settings()


class TokenRequest(BaseModel):
    """Request model for token generation."""
    user_id: str
    expires_in_days: Optional[int] = 30


class TokenResponse(BaseModel):
    """Response model for token generation."""
    access_token: str
    token_type: str = "bearer"
    user_id: str
    expires_in_days: int


@router.post("/generate-token", response_model=TokenResponse, summary="Generate JWT Token for Testing")
async def generate_token(request: TokenRequest):
    """
    Generate a JWT token for testing/development purposes.
    
    The generated token is logged to the console and can be copied from there.
    
    Args:
        user_id: User/Driver ID to include in the token
        expires_in_days: Number of days the token should be valid (default: 30)
    
    Returns:
        Token details with the generated access token
    """
    if not request.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_id is required"
        )
    
    # Create payload with claims
    now = datetime.now(timezone.utc)
    payload = {
        "sub": request.user_id,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=request.expires_in_days)).timestamp()),
    }
    
    # Generate token
    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    
    # Log the generated token with endpoint information
    logger.info(
        f"\n{'='*80}\n"
        f"🔐 JWT Token Generated\n"
        f"{'='*80}\n"
        f"Endpoint: POST /auth/generate-token\n"
        f"User ID: {request.user_id}\n"
        f"Valid for: {request.expires_in_days} days\n"
        f"Algorithm: {settings.JWT_ALGORITHM}\n"
        f"\n📋 Token:\n{token}\n"
        f"\n💡 Usage (in Authorization header):\nBearer {token}\n"
        f"{'='*80}\n"
    )
    
    return TokenResponse(
        access_token=token,
        user_id=request.user_id,
        expires_in_days=request.expires_in_days
    )
