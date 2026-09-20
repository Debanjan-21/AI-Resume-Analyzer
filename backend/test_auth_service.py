import asyncio

from app.schemas.user_schema import RegisterUserRequest
from app.services.auth_service import AuthService


async def main():

    user = RegisterUserRequest(
        name="Debanjan",
        email="debanjan@gmail.com",
        password="shadow123"
    )

    result = await AuthService.register_user(user)

    print(result)


asyncio.run(main())