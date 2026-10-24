import os
import sys

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "..", "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import HTTPException

# Locate compiled React frontend assets
dist_dir = os.path.join(current_dir, "..", "frontend", "dist")
index_file = os.path.join(dist_dir, "index.html")

if os.path.exists(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="spa_static_assets")

    @app.get("/")
    @app.get("/index.html")
    def serve_frontend_root():
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"status": "online", "app": "BloomWorks Garment ERP"}

    @app.get("/{full_path:path}")
    def serve_spa_client_routes(full_path: str):
        # Do not catch API routes, Swagger docs, or openapi schema
        if (
            full_path.startswith("api")
            or full_path == "docs"
            or full_path == "openapi.json"
            or full_path == "redoc"
        ):
            raise HTTPException(status_code=404, detail="Not Found")

        # If a real static file was requested (e.g. favicon.ico, logo.png)
        target_file = os.path.join(dist_dir, full_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)

        # Serve index.html for all React Router client paths (/login, /payroll, etc.)
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"status": "online", "app": "BloomWorks Garment ERP"}
