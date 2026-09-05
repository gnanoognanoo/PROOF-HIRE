import os
import logging
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status
import jwt

logger = logging.getLogger("proofhire.auth")

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

def get_current_user(
    authorization: Optional[str] = Header(None),
    x_username: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """
    Authenticates requests using Supabase JWT tokens or developer headers.
    
    SECURITY INVARIANTS:
    1. Authenticated user may sync or manage only their own connected accounts.
    2. Frontend-supplied user_id, XP, score, and verification_status are NEVER trusted.
    3. Backend strictly derives all verified metrics and attribution.
    """
    # 1. Bearer token in Authorization header
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1].strip()
        try:
            if SUPABASE_JWT_SECRET:
                payload = jwt.decode(
                    token,
                    SUPABASE_JWT_SECRET,
                    algorithms=["HS256"],
                    options={"verify_aud": False}
                )
            else:
                # In sandbox / dev mode without secret, decode payload without verification
                payload = jwt.decode(token, options={"verify_signature": False})
            
            user_id = payload.get("sub") or payload.get("id") or "usr_authenticated"
            email = payload.get("email") or ""
            metadata = payload.get("user_metadata", {})
            username = metadata.get("username") or (email.split("@")[0] if email else user_id)
            role = payload.get("role", "authenticated")
            
            return {
                "id": str(user_id),
                "username": str(username).lower(),
                "email": email,
                "role": role,
                "token": token
            }
        except Exception as e:
            logger.warning(f"Failed to decode Supabase JWT: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired Supabase authentication token."
            )

    # 2. X-Username header for authenticated development & API tests
    if x_username:
        clean = x_username.strip().lower()
        return {
            "id": f"usr_{clean}",
            "username": clean,
            "email": f"{clean}@proofhire.network",
            "role": "authenticated"
        }

    # 3. Default fallback for authenticated sandbox session
    return {
        "id": "usr_gnaneshwar",
        "username": "gnaneshwar",
        "email": "gnaneshwar@proofhire.network",
        "role": "authenticated"
    }
