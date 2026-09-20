from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router
from app.api.resume import router as resume_router
from app.api.dashboard import router as dashboard_router
from app.api.analysis import get_career_recommendations_endpoint, router as analysis_router
from app.schemas.analysis_schema import RecommendationRequest, RecommendationsBlock

app = FastAPI(
    title="AI Resume Analyzer API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(resume_router)
app.include_router(dashboard_router)
app.include_router(analysis_router)


@app.post("/api/recommendations", response_model=RecommendationsBlock, tags=["Recommendations"])
async def direct_recommendations(request: RecommendationRequest):
    """Direct alias endpoint for /api/recommendations."""
    return await get_career_recommendations_endpoint(request)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Resume Analyzer Backend",
        "port": 8000,
    }


@app.get("/")
async def home():
    return {
        "status": "running",
        "project": "AI Resume Analyzer",
        "endpoints": [
            "/api/health",
            "/api/analyze",
            "/api/analyze/upload",
            "/api/analyze/history",
            "/api/recommendations",
            "/api/analyze/recommendations",
            "/api/auth/login",
            "/api/auth/register",
            "/api/resumes/upload",
            "/api/dashboard",
        ],
    }