from app.config.database import users_collection
from app.models.user import UserModel
from app.schemas.user_schema import (
    RegisterUserRequest,
    UserResponse,
    LoginUserRequest,
    TokenResponse
)
from app.utils.password import hash_password
from app.utils.password import verify_password
from app.utils.jwt_handler import create_access_token


class AuthService:

    @staticmethod
    async def register_user(
        user: RegisterUserRequest
    ) -> UserResponse:

        # Check whether email already exists
        existing_user = await users_collection.find_one(
            {
                "email": user.email.lower()
            }
        )

        if existing_user:
            raise ValueError(
                "Email already registered."
            )

        # Hash the password
        hashed_password = hash_password(
            user.password
        )

        # Create MongoDB document
        new_user = UserModel.create(
            name=user.name,
            email=user.email,
            hashed_password=hashed_password
        )

        # Insert user
        result = await users_collection.insert_one(
            new_user
        )

        # Return response
        return UserResponse(
            id=str(result.inserted_id),
            name=new_user["name"],
            email=new_user["email"]
        )

    @staticmethod
    async def login_user(
        email: str,
        password: str
    ) -> TokenResponse:

        existing_user = await users_collection.find_one(
            {
                "email": email.lower()
            }
        )

        if not existing_user:
            raise ValueError("Invalid email or password.")

        if not existing_user.get("is_active", True):
            raise ValueError("Account is disabled.")

        password_valid = verify_password(
            password,
            existing_user["hashed_password"]
        )

        if not password_valid:
            raise ValueError("Invalid email or password.")

        token = create_access_token(
            {
                "sub": existing_user["email"],
                "role": existing_user["role"]
            }
        )

        return TokenResponse(
            access_token=token
        )