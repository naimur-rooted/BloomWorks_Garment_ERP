from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database
from app.core.config import settings

_client: Optional[MongoClient] = None
_db: Optional[Database] = None


def get_mongo_database() -> Optional[Database]:
    global _client, _db
    if not settings.MONGODB_URL:
        return None
    if _db is None:
        try:
            _client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=4000)
            _db = _client[settings.MONGODB_DB_NAME]
        except Exception as e:
            print(f"[MongoDB Warning] Connection error: {e}")
            return None
    return _db
