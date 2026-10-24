import json
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Integer, Numeric, Text, DateTime, Date, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


# -------------------------------------------------------------
# 1. FABRIC ROLL & 4-POINT INSPECTION (ASTM D5430)
# -------------------------------------------------------------
class FabricRoll(TimestampMixin, Base):
    __tablename__ = "fabric_rolls"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    roll_barcode: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    order_number: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    material_name: Mapped[str] = mapped_column(String(200), nullable=False)
    supplier_roll_no: Mapped[str] = mapped_column(String(100), nullable=False)
    shade_lot: Mapped[str] = mapped_column(String(50), nullable=False, default="Lot A")  # Lot A, Lot B, Lot C
    roll_length_yds: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    usable_width_in: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    gsm: Mapped[int] = mapped_column(Integer, nullable=False, default=180)
    shrinkage_length_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=Decimal("-3.00"))
    shrinkage_width_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=Decimal("-2.50"))
    torque_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=Decimal("1.20"))
    
    # 4-Point System (ASTM D5430)
    four_point_score: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False, default=Decimal("0.00"))
    points_per_100_sq_yds: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False, default=Decimal("0.00"))
    inspection_status: Mapped[str] = mapped_column(String(50), nullable=False, default="PENDING")  # PASSED, REJECTED, QUARANTINE
    defects_json: Mapped[str | None] = mapped_column(Text)

    # Relaxation Control (Knits / Spandex)
    relaxation_status: Mapped[str] = mapped_column(String(50), nullable=False, default="READY")  # REQUIRED, RELAXING, READY
    relaxation_hours_required: Mapped[int] = mapped_column(Integer, nullable=False, default=24)
    relaxation_started_at: Mapped[datetime | None] = mapped_column(DateTime)


# -------------------------------------------------------------
# 2. QUALITY ASSURANCE: DHU & AQL 2.5 AUDIT (ISO 2859-1)
# -------------------------------------------------------------
class QualityAudit(TimestampMixin, Base):
    __tablename__ = "quality_audits"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    audit_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    order_number: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    style_code: Mapped[str] = mapped_column(String(100), nullable=False)
    line_number: Mapped[str] = mapped_column(String(50), nullable=False)
    audit_type: Mapped[str] = mapped_column(String(50), nullable=False)  # INLINE_TRAFFIC, ENDLINE_100, FINAL_AQL
    
    total_inspected: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_passed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_defective: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    critical_defects: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    major_defects: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    minor_defects: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    dhu_score: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False, default=Decimal("0.00"))  # Defects per 100 units

    # AQL Standards (MIL-STD-105E / ISO 2859-1)
    aql_level: Mapped[str] = mapped_column(String(50), nullable=False, default="2.5 Normal Level II")
    sample_size: Mapped[int] = mapped_column(Integer, nullable=False, default=125)
    allowed_defects: Mapped[int] = mapped_column(Integer, nullable=False, default=7)
    audit_result: Mapped[str] = mapped_column(String(50), nullable=False, default="PENDING")  # PASS, FAIL
    
    defects_breakdown_json: Mapped[str | None] = mapped_column(Text)
    inspector_name: Mapped[str] = mapped_column(String(150), nullable=False)


# -------------------------------------------------------------
# 3. ASSORTED RATIO PACKING & CBM CONTAINER OPTIMIZER
# -------------------------------------------------------------
class PackingPlan(TimestampMixin, Base):
    __tablename__ = "packing_plans"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    plan_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    order_number: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    pack_type: Mapped[str] = mapped_column(String(50), nullable=False, default="ASSORTED_RATIO")  # SOLID, ASSORTED_RATIO
    ratio_formula: Mapped[str] = mapped_column(String(200), nullable=False)  # e.g., "S:1, M:2, L:2, XL:1 = 6 pcs/ctn"
    pieces_per_carton: Mapped[int] = mapped_column(Integer, nullable=False, default=12)
    total_cartons: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    residual_loose_pieces: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # Volumetric CBM Metrics
    carton_length_cm: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False, default=Decimal("60.00"))
    carton_width_cm: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False, default=Decimal("40.00"))
    carton_height_cm: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False, default=Decimal("30.00"))
    cbm_per_carton: Mapped[Decimal] = mapped_column(Numeric(10, 4), nullable=False, default=Decimal("0.0720"))
    total_shipment_cbm: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    gross_weight_per_carton_kg: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False, default=Decimal("8.50"))
    total_gross_weight_kg: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    
    # 3D Container Stuffing
    container_type: Mapped[str] = mapped_column(String(50), nullable=False, default="40FT_HC")  # 20FT, 40FT, 40FT_HC
    container_max_cbm: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False, default=Decimal("68.00"))
    container_utilization_pct: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False, default=Decimal("0.00"))
    cartons_detail_json: Mapped[str | None] = mapped_column(Text)


# -------------------------------------------------------------
# 4. CRITICAL PATH T&A (DAG ENGINE)
# -------------------------------------------------------------
class CriticalPathMilestone(TimestampMixin, Base):
    __tablename__ = "critical_path_milestones"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_number: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    milestone_code: Mapped[str] = mapped_column(String(100), nullable=False)
    milestone_name: Mapped[str] = mapped_column(String(200), nullable=False)
    predecessor_code: Mapped[str | None] = mapped_column(String(100))
    lead_days: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    planned_start: Mapped[date] = mapped_column(Date, nullable=False)
    planned_end: Mapped[date] = mapped_column(Date, nullable=False)
    actual_start: Mapped[date | None] = mapped_column(Date)
    actual_end: Mapped[date | None] = mapped_column(Date)
    float_days: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_critical: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="ON_TRACK")  # ON_TRACK, DELAYED, COMPLETED
    responsible_role: Mapped[str] = mapped_column(String(100), nullable=False, default="Merchandiser")


# -------------------------------------------------------------
# 5. COMMERCIAL EXIM: MASTER LC & JOB COST VARIANCE
# -------------------------------------------------------------
class CommercialLC(TimestampMixin, Base):
    __tablename__ = "commercial_lcs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    master_lc_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    order_number: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    buyer_name: Mapped[str] = mapped_column(String(150), nullable=False)
    lc_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="USD")
    issuing_bank: Mapped[str] = mapped_column(String(150), nullable=False)
    expiry_date: Mapped[date] = mapped_column(Date, nullable=False)
    latest_shipment_date: Mapped[date] = mapped_column(Date, nullable=False)
    
    # Back-to-Back (B2B) LC Entitlement & Utilization
    max_b2b_allowed_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=Decimal("75.00"))
    total_b2b_opened: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    b2b_utilization_pct: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False, default=Decimal("0.00"))
    b2b_ledger_json: Mapped[str | None] = mapped_column(Text)

    # Job Costing Variance (Standard Pre-Cost vs Actual Post-Cost)
    budgeted_cost: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    actual_cost: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    variance_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    variance_status: Mapped[str] = mapped_column(String(50), nullable=False, default="FAVORABLE")  # FAVORABLE, UNFAVORABLE
    cost_variance_json: Mapped[str | None] = mapped_column(Text)


# -------------------------------------------------------------
# 6. EMPLOYEE SALARY & PIECE-RATE PAYROLL RECORD
# -------------------------------------------------------------
class EmployeeSalaryRecord(TimestampMixin, Base):
    __tablename__ = "employee_salary_records"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    employee_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)  # Sewing, Cutting, Finishing, Quality
    designation: Mapped[str] = mapped_column(String(100), nullable=False)  # Senior Operator, Line Supervisor, Helper
    skill_grade: Mapped[str] = mapped_column(String(50), nullable=False, default="Grade A")  # Grade A, Grade B, Grade C
    salary_type: Mapped[str] = mapped_column(String(50), nullable=False, default="PIECE_RATE")  # PIECE_RATE, FIXED_SALARY
    
    # Financial breakdown
    base_salary: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("150.00"))
    piece_rate_earnings: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    operations_completed_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    overtime_hours: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False, default=Decimal("0.00"))
    overtime_pay: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    efficiency_bonus: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    attendance_allowance: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("20.00"))
    gross_earnings: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    
    deductions: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("5.00"))
    net_payable_salary: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    payment_status: Mapped[str] = mapped_column(String(50), nullable=False, default="APPROVED")  # DRAFT, APPROVED, PAID
    month_year: Mapped[str] = mapped_column(String(50), nullable=False, default="October 2026")
    breakdown_json: Mapped[str | None] = mapped_column(Text)
