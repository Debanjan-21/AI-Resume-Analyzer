from datetime import datetime, UTC


class UserModel:
    """
    Creates a MongoDB document for a user.
    """

    @staticmethod
    def create(
        name: str,
        email: str,
        hashed_password: str
    ) -> dict:

        now = datetime.now(UTC)

        return {
            "name": name,
            "email": email.lower(),
            "hashed_password": hashed_password,
            "role": "user",
            "is_active": True,
            "created_at": now,
            "updated_at": now
        }