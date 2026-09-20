import asyncio

from app.schemas.user_schema import LoginUserRequest
from app.services.auth_service import AuthService


async def main():
    user = LoginUserRequest(
        email="debanjan@example.com",
        password="shadow123"
    )

    result = await AuthService.login_user(user)

    print(result)


asyncio.run(main())