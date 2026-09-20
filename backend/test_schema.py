from app.schemas.user_schema import RegisterUserRequest

user = RegisterUserRequest(
    name="Debanjan",
    email="debanjan@gmail.com",
    password="shadow123"
)

print(user)