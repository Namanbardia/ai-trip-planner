import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router
from app.auth import ADMIN_USERNAME  # noqa: F401  (ensures .env is loaded at startup)

# Allowed frontend origins (dev server by default; override with ALLOWED_ORIGINS env var,
# comma-separated, e.g. "https://myapp.example.com,https://www.example.com")
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if o.strip()
]

app = FastAPI(
    title="AI-Powered End-to-End Trip Planner API",
    description=(
        "Backend service with Semantic Matching, K-Means Clustering, "
        "Route Optimization, Personalization, and Admin JWT Authentication"
    ),
    version="1.1.0"
)

# CORS: explicit allow-list (never "*" together with credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "AI-Powered End-to-End Trip Planner",
        "endpoints": {
            "login": "POST /api/auth/login",
            "whoami": "GET /api/auth/me",
            "destinations": "GET /api/destinations",
            "plan_trip": "POST /api/plan-trip",
            "feedback": "POST /api/feedback",
            "geocode_hotel": "POST /api/geocode-hotel",
            "user_profile": "GET /api/user-profile",
            "compare_optimizers": "POST /api/compare-optimizers"
        }
    }

@app.get("/api/health")
async def health():
    return {"status": "healthy"}
