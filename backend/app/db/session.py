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


def _ensure_tables_and_seed(eng):
    try:
        import app.models  # noqa: F401 - registers all ORM models
        from app.db.base import Base
        Base.metadata.create_all(bind=eng)

        # Seed default admin user if not present
        from app.models.user import User, Role
        from app.core.security import get_password_hash
        with Session(eng) as session:
            admin = session.query(User).filter(User.username == "admin").first()
            if not admin:
                admin = User(
                    username="admin",
                    email="admin@nextgen.com",
                    full_name="System Administrator",
                    hashed_password=get_password_hash("admin123"),
                    role=Role.ADMIN,
                    is_active=True,
                    must_change_password=False,
                )
                session.add(admin)
                session.commit()
                print("[DB Notice] Default admin user initialized (admin/admin123).")
    except Exception as ex:
        print(f"[DB Notice] _ensure_tables_and_seed warning: {ex}")


def get_db():
    global _tables_initialized, engine, SessionLocal
    if not _tables_initialized:
        try:
            _ensure_tables_and_seed(engine)
            _tables_initialized = True
        except Exception as e:
            print(f"[DB Notice] Initialization failed on primary engine: {e}. Rebuilding on /tmp SQLite.")
            engine = create_engine("sqlite:////tmp/garment_erp.db", connect_args={"check_same_thread": False})
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
            _ensure_tables_and_seed(engine)
            _tables_initialized = True

    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
