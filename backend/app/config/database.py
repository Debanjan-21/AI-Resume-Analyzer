from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import MONGODB_URL, DATABASE_NAME

try:
    client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=2000)
    db = client[DATABASE_NAME or "ai_resume_analyzer"]
    users_collection = db["users"]
    resumes_collection = db["resumes"]
except Exception as e:
    print(f"MongoDB connection notice: {e}")
    client = None
    db = None
    users_collection = None
    resumes_collection = None