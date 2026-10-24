from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.modules.enterprise.services import (
    get_matrix_orders,
    calculate_costing_sheet,
    list_fabric_rolls,
    calculate_4point_score,
    list_quality_audits,
    calculate_aql_standards,
    list_packing_plans,
    calculate_carton_packing,
    list_critical_path_milestones,
    list_commercial_records,
    list_payroll_records,
    calculate_piece_rate_pay,
)

router = APIRouter(prefix="/enterprise", tags=["Industrial Garment Manufacturing Engine"])


# 1. MATRIX ORDERS & COSTING
@router.get("/matrix-orders")
def get_matrix_orders_endpoint():
    return get_matrix_orders()


class CostingCalculationRequest(BaseModel):
    garment_type: str = "Knitwear"
    fabric_unit_cost: float
    fabric_consumption: float
    smv_minutes: float
    line_minute_cost: Optional[float] = 0.045
    expected_efficiency_pct: Optional[float] = 65.0
    trims_cost: Optional[float] = 0.85
    wash_cost: Optional[float] = 0.40
    margin_pct: Optional[float] = 10.0


@router.post("/calculate-costing")
def calculate_costing_endpoint(payload: CostingCalculationRequest):
    return calculate_costing_sheet(
        garment_type=payload.garment_type,
        fabric_unit_cost=payload.fabric_unit_cost,
        fabric_consumption=payload.fabric_consumption,
        smv_minutes=payload.smv_minutes,
        line_minute_cost=payload.line_minute_cost or 0.045,
        expected_efficiency_pct=payload.expected_efficiency_pct or 65.0,
        trims_cost=payload.trims_cost or 0.85,
        wash_cost=payload.wash_cost or 0.40,
        margin_pct=payload.margin_pct or 10.0,
    )


# 2. FABRIC ROLLS & 4-POINT INSPECTION
@router.get("/fabric-rolls")
def get_fabric_rolls(order_number: Optional[str] = Query(None), db: Session = Depends(get_db)):
    return list_fabric_rolls(db, order_number=order_number)


class FourPointScoreRequest(BaseModel):
    defects: List[Dict[str, Any]]
    length_yds: float
    width_inches: float


@router.post("/4point-calculator")
def calculate_4point_score_endpoint(payload: FourPointScoreRequest):
    return calculate_4point_score(
        defects=payload.defects,
        length_yds=payload.length_yds,
        width_inches=payload.width_inches,
    )


# 3. QUALITY ASSURANCE & AQL 2.5
@router.get("/quality-audits")
def get_quality_audits(db: Session = Depends(get_db)):
    return list_quality_audits(db)


class AqlStandardRequest(BaseModel):
    lot_size: int
    aql_target: Optional[float] = 2.5


@router.post("/aql-calculator")
def calculate_aql_standards_endpoint(payload: AqlStandardRequest):
    return calculate_aql_standards(
        lot_size=payload.lot_size,
        aql_target=payload.aql_target or 2.5,
    )


# 4. PACKING & CONTAINER CBM
@router.get("/packing-plans")
def get_packing_plans(db: Session = Depends(get_db)):
    return list_packing_plans(db)


class CartonCalculationRequest(BaseModel):
    total_garments: int
    pieces_per_carton: Optional[int] = 12
    length_cm: Optional[float] = 60.0
    width_cm: Optional[float] = 40.0
    height_cm: Optional[float] = 30.0
    garment_weight_kg: Optional[float] = 0.32
    carton_tare_weight_kg: Optional[float] = 0.95
    container_type: Optional[str] = "40FT_HC"


@router.post("/carton-cbm-calculator")
def calculate_carton_cbm_endpoint(payload: CartonCalculationRequest):
    return calculate_carton_packing(
        total_garments=payload.total_garments,
        pieces_per_carton=payload.pieces_per_carton or 12,
        length_cm=payload.length_cm or 60.0,
        width_cm=payload.width_cm or 40.0,
        height_cm=payload.height_cm or 30.0,
        garment_weight_kg=payload.garment_weight_kg or 0.32,
        carton_tare_weight_kg=payload.carton_tare_weight_kg or 0.95,
        container_type=payload.container_type or "40FT_HC",
    )


# 5. CRITICAL PATH T&A
@router.get("/critical-path-tna")
def get_critical_path_tna(order_number: Optional[str] = Query("PO-8821"), db: Session = Depends(get_db)):
    return list_critical_path_milestones(db, order_number=order_number or "PO-8821")


# 6. COMMERCIAL EXIM
@router.get("/commercial-exim")
def get_commercial_records(db: Session = Depends(get_db)):
    return list_commercial_records(db)


# 7. WORKFORCE COMPENSATION & PAYROLL
@router.get("/payroll")
def get_payroll_records_endpoint(department: Optional[str] = Query(None), db: Session = Depends(get_db)):
    return list_payroll_records(db, department=department)


class PieceRateCalculationRequest(BaseModel):
    base_salary: float = 120.0
    pieces_completed: int
    rate_per_piece: float
    overtime_hours: Optional[float] = 0.0
    hourly_ot_rate: Optional[float] = 1.80
    efficiency_bonus: Optional[float] = 0.0
    attendance_allowance: Optional[float] = 20.0
    deductions: Optional[float] = 5.0


@router.post("/calculate-piece-rate")
def calculate_piece_rate_endpoint(payload: PieceRateCalculationRequest):
    return calculate_piece_rate_pay(
        base_salary=payload.base_salary,
        pieces_completed=payload.pieces_completed,
        rate_per_piece=payload.rate_per_piece,
        overtime_hours=payload.overtime_hours or 0.0,
        hourly_ot_rate=payload.hourly_ot_rate or 1.80,
        efficiency_bonus=payload.efficiency_bonus or 0.0,
        attendance_allowance=payload.attendance_allowance or 20.0,
        deductions=payload.deductions or 5.0,
    )

