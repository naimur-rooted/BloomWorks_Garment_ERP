import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

db_url = settings.sync_database_url if hasattr(settings, "sync_database_url") else settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)

# In serverless environments (e.g. Vercel), if SQLite is used, ensure it targets writable /tmp
if db_url.startswith("sqlite") and os.environ.get("VERCEL"):
    db_url = "sqlite:////tmp/garment_erp.db"

connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


_tables_initialized = False


def get_db():
    global _tables_initialized
    if not _tables_initialized:
        try:
            from app.db.base import Base
            Base.metadata.create_all(bind=engine)
            _tables_initialized = True
        except Exception as e:
            print(f"[DB Init Notice] {e}")
            _tables_initialized = True
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
