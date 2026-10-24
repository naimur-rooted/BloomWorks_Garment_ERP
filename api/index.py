import os
import sys

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "..", "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

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
