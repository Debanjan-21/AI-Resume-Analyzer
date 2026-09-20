from app.utils.jwt_handler import (
    create_access_token,
    verify_access_token,
)

token = create_access_token(
    {
        "sub": "debanjan@gmail.com",
        "role": "user",
    }
)

print("Generated Token:")
print(token)

payload = verify_access_token(token)

print("\nDecoded Payload:")
print(payload)