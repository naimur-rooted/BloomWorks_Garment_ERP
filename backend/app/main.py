from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.models import *  # noqa: F401, E402
from app.modules.auth.router import router as auth_router
from app.modules.buyers.router import router as buyers_router
from app.modules.suppliers.router import router as suppliers_router
from app.modules.styles.router import router as styles_router
from app.modules.materials.router import (
    color_router,
    material_router,
    size_router,
)
from app.modules.orders.router import router as orders_router
from app.modules.bom.router import router as bom_router
from app.modules.material_requirements.router import router as material_requirements_router
from app.modules.inventory.router import router as inventory_router
from app.modules.procurement.router import (
    gr_router,
    po_router,
    pr_router,
)
from app.modules.production.router import (
    cutting_router,
    finishing_router,
    plan_router,
    sewing_router,
    wo_router,
)
from app.modules.quality.router import router as quality_router
from app.modules.packing.router import router as packing_router
from app.modules.shipments.router import router as shipments_router
from app.modules.tna.router import router as tna_router
from app.modules.reports.router import router as reports_router
from app.core.security import get_password_hash
from app.models.user import Role, User
from app.db.session import SessionLocal

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = settings.API_PREFIX

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(buyers_router, prefix=API_PREFIX)
app.include_router(suppliers_router, prefix=API_PREFIX)
app.include_router(styles_router, prefix=API_PREFIX)
app.include_router(material_router, prefix=API_PREFIX)
app.include_router(color_router, prefix=API_PREFIX)
app.include_router(size_router, prefix=API_PREFIX)
app.include_router(orders_router, prefix=API_PREFIX)
app.include_router(bom_router, prefix=API_PREFIX)
app.include_router(material_requirements_router, prefix=API_PREFIX)
app.include_router(inventory_router, prefix=API_PREFIX)
app.include_router(pr_router, prefix=API_PREFIX)
app.include_router(po_router, prefix=API_PREFIX)
app.include_router(gr_router, prefix=API_PREFIX)
app.include_router(plan_router, prefix=API_PREFIX)
app.include_router(wo_router, prefix=API_PREFIX)
app.include_router(cutting_router, prefix=API_PREFIX)
app.include_router(sewing_router, prefix=API_PREFIX)
app.include_router(finishing_router, prefix=API_PREFIX)
app.include_router(quality_router, prefix=API_PREFIX)
app.include_router(packing_router, prefix=API_PREFIX)
app.include_router(shipments_router, prefix=API_PREFIX)
app.include_router(tna_router, prefix=API_PREFIX)
app.include_router(reports_router, prefix=API_PREFIX)


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@app.on_event("startup")
def on_startup():
    """Create tables and ensure the default admin user exists.

    This makes deployments self-healing on platforms like Render where
    migrations/seeding may not run automatically.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.username == "admin").first():
            db.add(
                User(
                    username="admin",
                    email="admin@nextgen.com",
                    full_name="System Administrator",
                    hashed_password=get_password_hash("admin123"),
                    role=Role.ADMIN,
                    is_active=True,
                )
            )
            db.commit()
            print("--> Default admin user created (admin / admin123)")
    finally:
        db.close()
