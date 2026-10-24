from typing import Optional, Any
from app.core.config import settings

try:
    from pymongo import MongoClient
    from pymongo.database import Database
except ImportError:
    MongoClient = None
    Database = Any

_client: Optional[Any] = None
_db: Optional[Any] = None


def get_mongo_database() -> Optional[Any]:
    global _client, _db
    if not settings.MONGODB_URL or MongoClient is None:
        return None
    if _db is None:
        try:
            _client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=4000)
            _db = _client[settings.MONGODB_DB_NAME]
        except Exception as e:
            print(f"[MongoDB Warning] Connection error: {e}")
            return None
    return _db
