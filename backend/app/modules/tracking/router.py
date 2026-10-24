from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.modules.tracking.service import (
    get_wip_pipeline_summary,
    list_bundles,
    process_barcode_scan,
    generate_new_bundles,
    reset_demo_pipeline,
)

router = APIRouter(prefix="/tracking", tags=["Shop Floor Control & Bundle Tracking"])


class ScanRequest(BaseModel):
    barcode: str
    target_stage: Optional[str] = "AUTO_NEXT"
    station_id: Optional[str] = "STATION-01"
    operator_name: Optional[str] = "Operator"
    defect_count: Optional[int] = 0
    notes: Optional[str] = None


class GenerateBundlesRequest(BaseModel):
    order_number: str
    style_code: str
    color_name: str
    size_code: str
    cut_number: str
    total_quantity: int
    bundle_size: Optional[int] = 20


@router.get("/wip-summary")
def get_wip_summary(db: Session = Depends(get_db)):
    return get_wip_pipeline_summary(db)


@router.get("/bundles")
def get_bundles(
    stage: Optional[str] = Query(None),
    order_number: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return list_bundles(db, stage=stage, order_number=order_number)


@router.post("/scan")
def scan_bundle(payload: ScanRequest, db: Session = Depends(get_db)):
    result = process_barcode_scan(
        db=db,
        barcode=payload.barcode,
        target_stage=payload.target_stage,
        station_id=payload.station_id,
        operator_name=payload.operator_name,
        defect_count=payload.defect_count or 0,
        notes=payload.notes,
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result


@router.post("/generate")
def generate_bundles(payload: GenerateBundlesRequest, db: Session = Depends(get_db)):
    return generate_new_bundles(
        db=db,
        order_number=payload.order_number,
        style_code=payload.style_code,
        color_name=payload.color_name,
        size_code=payload.size_code,
        cut_number=payload.cut_number,
        total_quantity=payload.total_quantity,
        bundle_size=payload.bundle_size or 20,
    )


@router.post("/reset-demo")
def reset_demo(db: Session = Depends(get_db)):
    return reset_demo_pipeline(db)
