from pydantic import BaseModel, EmailStr, Field, ConfigDict


class RegisterUserRequest(BaseModel):
    """
    Request model for user registration.
    """

    name: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Full name of the user"
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="User password"
    )


class LoginUserRequest(BaseModel):
    """
    Request model for user login.
    """

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """
    User information returned to the client.
    """

    id: str
    name: str
    email: EmailStr

    model_config = ConfigDict(
        from_attributes=True
    )
    
class TokenResponse(BaseModel):
    """
    JWT token returned after successful login.
    """

    access_token: str
    token_type: str = "bearer"