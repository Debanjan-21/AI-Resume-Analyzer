from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.config.database import users_collection
from app.utils.jwt_handler import verify_access_token
from app.services.local_user_store import LocalUserStore

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
):
    """
    Verify JWT and return the current user.
    """

    try:
        payload = verify_access_token(token)

        email = payload.get("sub")

        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token."
            )

        user = None
        try:
            if users_collection is not None:
                user = await users_collection.find_one({"email": email})
        except Exception as e:
            print(f"MongoDB notice in get_current_user: {e}")

        if user is None:
            user = LocalUserStore.find_by_email(email)

        if user is None:
            # Reconstruct active user from valid JWT payload if not in store
            user = {
                "_id": email,
                "name": payload.get("name", email.split("@")[0]),
                "email": email,
                "role": payload.get("role", "user"),
                "is_active": True,
            }

        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is disabled."
            )

        return user

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token."
        )