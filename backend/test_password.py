from app.utils.password import hash_password, verify_password

password = "shadow123"

hashed = hash_password(password)

print(f"Original Password : {password}")
print(f"Hashed Password   : {hashed}")

is_valid = verify_password(password, hashed)

print(f"Password Verified : {is_valid}")