import json
import os
from pathlib import Path
from typing import Optional, Dict

STORE_PATH = Path(__file__).resolve().parent.parent / "data" / "local_users.json"


class LocalUserStore:
    """
    Local JSON-backed user store providing seamless fallback
    when MongoDB Atlas is offline or unreachable via DNS.
    """

    @classmethod
    def _load(cls) -> Dict[str, dict]:
        if not STORE_PATH.exists():
            return {}
        try:
            with open(STORE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    @classmethod
    def _save(cls, data: Dict[str, dict]):
        try:
            STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
            with open(STORE_PATH, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Notice: Failed to save local users store: {e}")

    @classmethod
    def find_by_email(cls, email: str) -> Optional[dict]:
        users = cls._load()
        return users.get(email.strip().lower())

    @classmethod
    def save_user(cls, user_doc: dict):
        users = cls._load()
        email = user_doc["email"].strip().lower()
        users[email] = user_doc
        cls._save(users)
