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
        # If DATABASE_URL is localhost, unconfigured, or internal/Render host (unreachable or sleeping)
        if (
            "localhost" in db_url
            or "127.0.0.1" in db_url
            or not db_url
            or "sqlite" in db_url
            or "dpg-dam1rm67bikc73811cc0-a" in db_url
            or "render.com" in db_url
        ):
            db_url = "sqlite:////tmp/garment_erp.db"

    if db_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False, "timeout": 15}
    else:
        connect_args = {"connect_timeout": 3}

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
        return create_engine("sqlite:////tmp/garment_erp.db", connect_args={"check_same_thread": False, "timeout": 15})


engine = _create_resilient_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

_tables_initialized = False


def _ensure_tables_and_seed(eng):
    try:
        import app.models  # noqa: F401 - registers all ORM models
        from app.db.base import Base
        Base.metadata.create_all(bind=eng)

        # Ensure any missing SQLite columns on existing tables are migrated safely
        try:
            with eng.connect() as conn:
                res = conn.exec_driver_sql("PRAGMA table_info(styles)")
                existing_cols = {row[1] for row in res.fetchall()}
                style_new_cols = [
                    ('style_type', 'VARCHAR(50)'),
                    ('brand', 'VARCHAR(100)'),
                    ('season', 'VARCHAR(50)'),
                    ('sub_category', 'VARCHAR(100)'),
                    ('gender', 'VARCHAR(50)'),
                    ('source_allocation', 'VARCHAR(50)'),
                    ('sam_minutes', 'NUMERIC(6, 2)'),
                    ('target_efficiency_pct', 'NUMERIC(5, 2)'),
                    ('creation_date', 'DATE'),
                    ('ocd_date', 'DATE'),
                    ('pcd_date', 'DATE'),
                    ('ex_factory_date', 'DATE'),
                    ('pd_merchant_name', 'VARCHAR(150)'),
                    ('prod_merchant_name', 'VARCHAR(150)'),
                    ('lifecycle_stage', 'VARCHAR(50)'),
                    ('risk_priority', 'VARCHAR(50)'),
                    ('risk_criterion', 'VARCHAR(255)'),
                    ('tna_progress_pct', 'INTEGER'),
                    ('active_milestone', 'VARCHAR(150)'),
                    ('costing_qty', 'NUMERIC(12, 2)'),
                    ('projection_qty', 'NUMERIC(12, 2)'),
                    ('placement_qty', 'NUMERIC(12, 2)'),
                    ('repeat_order', 'BOOLEAN'),
                    ('target_fob_bdt', 'NUMERIC(10, 2)'),
                    ('size_range', 'VARCHAR(200)'),
                    ('size_ratio', 'VARCHAR(100)'),
                    ('value_additions', 'VARCHAR(255)'),
                    ('has_lining', 'BOOLEAN'),
                    ('remarks', 'TEXT'),
                ]
                for col_name, col_type in style_new_cols:
                    if col_name not in existing_cols:
                        conn.exec_driver_sql(f"ALTER TABLE styles ADD COLUMN {col_name} {col_type}")
                conn.commit()
        except Exception as col_err:
            pass

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

            try:
                from app.db.factory_seed import seed_factory_data
                seed_factory_data(session)
            except Exception as seed_err:
                print(f"[DB Notice] factory seed notice: {seed_err}")
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
