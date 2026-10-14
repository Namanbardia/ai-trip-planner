from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router

app = FastAPI(
    title="AI-Powered End-to-End Trip Planner API",
    description="Backend service with Semantic Matching, K-Means Clustering, Cost Prediction, Route Optimization, and Personalization",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "AI-Powered End-to-End Trip Planner",
        "endpoints": {
            "destinations": "/api/destinations",
            "plan_trip": "/api/plan-trip",
            "feedback": "/api/feedback",
            "save_trip": "/api/save-trip",
            "user_profile": "/api/user-profile",
            "compare_optimizers": "/api/compare-optimizers"
        }
    }

@app.get("/api/health")
async def health():
    return {"status": "healthy"}
