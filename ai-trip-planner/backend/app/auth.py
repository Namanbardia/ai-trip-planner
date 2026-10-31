"""
Simple admin authentication for TripBuddy.

- Single admin user (credentials come from environment variables, see .env.example).
- Passwords are verified against a PBKDF2-SHA256 hash (never stored in plaintext).
- Sessions are stateless JWTs (HS256) sent as "Authorization: Bearer <token>".
"""
import os
import hmac
import hashlib
import secrets
import time
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

# Load .env if present (no-op when python-dotenv isn't installed or .env missing)
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:  # pragma: no cover
    pass

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
# Default hash below is PBKDF2-SHA256 of "admin123" (salt=tripbuddy, 100k iterations).
ADMIN_PASSWORD_HASH = os.getenv(
    "ADMIN_PASSWORD_HASH",
    "pbkdf2_sha256$100000$tripbuddy$ae685ed420b5c1ac7150986f22b0ca47adbe9d5880ff24ed6756fe32d1e71981",
)
JWT_SECRET = os.getenv("JWT_SECRET", "")  # generated per-process when unset
JWT_EXPIRY_SECONDS = int(os.getenv("JWT_EXPIRY_SECONDS", str(60 * 60 * 24 * 7)))  # 7 days
JWT_ALGORITHM = "HS256"

# Ephemeral fallback secret, generated ONCE per process so issued tokens remain
# verifiable for the lifetime of the server (they reset on restart).
_FALLBACK_SECRET = JWT_SECRET or secrets.token_hex(32)

_bearer = HTTPBearer(auto_error=False)


def _get_secret() -> str:
    return JWT_SECRET or _FALLBACK_SECRET


def hash_password(password: str, salt: Optional[str] = None) -> str:
    """PBKDF2-SHA256 hash in the form pbkdf2_sha256$iterations$salt$hexdigest."""
    salt = salt or secrets.token_hex(8)
    iterations = 100_000
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations).hex()
    return f"pbkdf2_sha256${iterations}${salt}${digest}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algo, iterations_s, salt, expected = stored_hash.split("$")
        if algo != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), salt.encode("utf-8"), int(iterations_s)
        ).hex()
        return hmac.compare_digest(digest, expected)
    except (ValueError, AttributeError):
        return False


def verify_credentials(username: str, password: str) -> bool:
    return hmac.compare_digest(username, ADMIN_USERNAME) and verify_password(password, ADMIN_PASSWORD_HASH)


def create_token(username: str) -> str:
    now = int(time.time())
    payload = {
        "sub": username,
        "iat": now,
        "exp": now + JWT_EXPIRY_SECONDS,
        "jti": secrets.token_hex(8),
    }
    return jwt.encode(payload, _get_secret(), algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Returns the token payload or raises jwt.PyJWTError."""
    return jwt.decode(token, _get_secret(), algorithms=[JWT_ALGORITHM])


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> dict:
    """FastAPI dependency: validates the Bearer token and returns the payload."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = decode_token(credentials.credentials)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


def require_auth(user: dict = Depends(get_current_user)) -> dict:
    return user
