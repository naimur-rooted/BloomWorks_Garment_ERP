import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings


def _create_resilient_engine():
    db_url = settings.sync_database_url if hasattr(settings, "sync_database_url") else settings.DATABASE_URL
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    # In serverless environments (e.g. Vercel)
    if os.environ.get("VERCEL"):
        # If DATABASE_URL is localhost, unconfigured, or internal Render host (unreachable from Vercel)
        if (
            "localhost" in db_url
            or "127.0.0.1" in db_url
            or not db_url
            or "sqlite" in db_url
            or "dpg-dam1rm67bikc73811cc0-a/" in db_url
        ):
            db_url = "sqlite:////tmp/garment_erp.db"

    connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

    try:
        eng = create_engine(
            db_url,
            connect_args=connect_args,
            pool_pre_ping=True,
        )
        # Test connection immediately
        with eng.connect() as conn:
            pass
        return eng
    except Exception as e:
        print(f"[DB Notice] Connection test failed for {db_url}: {e}. Falling back to SQLite /tmp.")
        return create_engine("sqlite:////tmp/garment_erp.db", connect_args={"check_same_thread": False})


engine = _create_resilient_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

_tables_initialized = False


def get_db():
    global _tables_initialized, engine, SessionLocal
    if not _tables_initialized:
        try:
            from app.db.base import Base
            Base.metadata.create_all(bind=engine)
            _tables_initialized = True
        except Exception as e:
            print(f"[DB Notice] create_all failed: {e}. Rebuilding on /tmp SQLite.")
            engine = create_engine("sqlite:////tmp/garment_erp.db", connect_args={"check_same_thread": False})
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
            try:
                from app.db.base import Base
                Base.metadata.create_all(bind=engine)
            except Exception as e2:
                print(f"[DB Notice] Fallback create_all error: {e2}")
            _tables_initialized = True

    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
