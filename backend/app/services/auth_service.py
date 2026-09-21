import uuid
from datetime import datetime, timezone
from app.config.database import users_collection
from app.models.user import UserModel
from app.schemas.user_schema import (
    RegisterUserRequest,
    UserResponse,
    TokenResponse
)
from app.utils.password import hash_password, verify_password
from app.utils.jwt_handler import create_access_token
from app.services.local_user_store import LocalUserStore


class AuthService:

    @staticmethod
    async def register_user(
        user: RegisterUserRequest
    ) -> UserResponse:
        email_clean = user.email.strip().lower()

        # Check existing user in MongoDB if available
        existing_user = None
        try:
            if users_collection is not None:
                existing_user = await users_collection.find_one({"email": email_clean})
        except Exception as e:
            print(f"MongoDB notice during registration check (using local fallback): {e}")

        # Check local fallback store if not found in MongoDB
        if not existing_user:
            existing_user = LocalUserStore.find_by_email(email_clean)

        if existing_user:
            raise ValueError("Email is already registered. Please sign in.")

        # Hash password
        hashed_password = hash_password(user.password)

        new_user = {
            "_id": str(uuid.uuid4()),
            "name": user.name.strip(),
            "email": email_clean,
            "hashed_password": hashed_password,
            "role": "user",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        # Always save to local store so offline auth works seamlessly
        LocalUserStore.save_user(new_user)

        # Attempt to save to MongoDB if connected
        try:
            if users_collection is not None:
                await users_collection.insert_one(new_user)
        except Exception as e:
            print(f"MongoDB persistence notice during registration (user saved locally): {e}")

        return UserResponse(
            id=str(new_user["_id"]),
            name=new_user["name"],
            email=new_user["email"]
        )

    @staticmethod
    async def login_user(
        email: str,
        password: str
    ) -> TokenResponse:
        email_clean = email.strip().lower()
        existing_user = None

        # Try MongoDB first
        try:
            if users_collection is not None:
                existing_user = await users_collection.find_one({"email": email_clean})
        except Exception as e:
            print(f"MongoDB notice during login (falling back to local user store): {e}")

        # Fallback to local store
        if not existing_user:
            existing_user = LocalUserStore.find_by_email(email_clean)

        if not existing_user:
            raise ValueError("No account found with this email. Please switch to 'Create Account' to sign up first.")

        if not existing_user.get("is_active", True):
            raise ValueError("Account is disabled.")

        password_valid = verify_password(
            password,
            existing_user["hashed_password"]
        )

        if not password_valid:
            raise ValueError("Incorrect password. Please try again.")

        token = create_access_token(
            {
                "sub": existing_user["email"],
                "name": existing_user.get("name", ""),
                "role": existing_user.get("role", "user")
            }
        )

        return TokenResponse(
            access_token=token
        )