import os
import sys

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "..", "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.db.session import engine, _ensure_tables_and_seed

# Initialize tables and seed default admin on serverless start
try:
    _ensure_tables_and_seed(engine)
except Exception as e:
    print(f"[Vercel Init Notice] Pre-seed error: {e}")

# ASGI middleware to ensure both /api/... and /... paths match backend routers
class VercelPathNormalizer:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope.get("type") == "http":
            path = scope.get("path", "")
            # If path does not start with /api, normalize it so FastAPI prefix matches
            if not path.startswith("/api") and not path.startswith("/docs") and not path.startswith("/openapi.json"):
                scope["path"] = "/api" + path
        await self.app(scope, receive, send)

app.add_middleware(VercelPathNormalizer)
