import json
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.enterprise_models import (
    FabricRoll,
    QualityAudit,
    PackingPlan,
    CriticalPathMilestone,
    CommercialLC,
    EmployeeSalaryRecord,
)
from app.models.order import BuyerOrder, OrderStatus


# ==============================================================================
# 1. MATRIX ORDERS & PRE-COSTING ENGINE (ALL DENOMINATED IN BDT ৳)
# ==============================================================================
DEMO_MATRIX_ORDERS = [
    {
        "po_number": "PO-8821",
        "buyer_name": "H&M Global Sourcing",
        "style_code": "POLO-CLASSIC-01",
        "product_type": "Knitwear (Polo Shirt)",
        "fabric_type": "100% Combed Cotton Pique 220 GSM",
        "smv_minutes": 18.50,
        "target_efficiency_pct": 65.0,
        "cm_cost_per_piece": 150.00,
        "currency": "BDT",
        "delivery_date": (date.today() + timedelta(days=25)).isoformat(),
        "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
        "matrix": [
            {"color": "Navy Blue", "quantities": {"XS": 100, "S": 300, "M": 600, "L": 600, "XL": 300, "XXL": 100}, "total": 2000, "unit_price": 820.00},
            {"color": "Heather Grey", "quantities": {"XS": 80, "S": 250, "M": 500, "L": 500, "XL": 250, "XXL": 80}, "total": 1660, "unit_price": 840.00},
            {"color": "Optic White", "quantities": {"XS": 50, "S": 150, "M": 300, "L": 300, "XL": 150, "XXL": 50}, "total": 1000, "unit_price": 810.00},
        ],
        "total_quantity": 4660,
        "total_value": 3844400.00,
        "costing_breakdown": {
            "fabric_cost": 420.00,
            "trims_cost": 105.00,
            "cm_making_cost": 150.00,
            "wash_embellishment": 50.00,
            "commercial_freight": 30.00,
            "factory_margin": 65.00,
            "quoted_fob_price": 820.00
        },
        "pom_specs": [
            {"pom_code": "POM-01", "name": "Total Body Length", "base_m": 72.0, "tolerance": 1.0, "grading_step": 2.0},
            {"pom_code": "POM-02", "name": "Chest Width (1/2)", "base_m": 54.0, "tolerance": 0.8, "grading_step": 2.5},
            {"pom_code": "POM-03", "name": "Across Shoulder", "base_m": 46.0, "tolerance": 0.5, "grading_step": 1.5},
            {"pom_code": "POM-04", "name": "Sleeve Length", "base_m": 22.0, "tolerance": 0.5, "grading_step": 1.0},
        ]
    },
    {
        "po_number": "PO-8822",
        "buyer_name": "Zara / Inditex",
        "style_code": "DENIM-SLIM-02",
        "product_type": "Denim Trousers (5-Pocket)",
        "fabric_type": "12.5oz Ring Spun Cotton Elastane Twill",
        "smv_minutes": 26.80,
        "target_efficiency_pct": 60.0,
        "cm_cost_per_piece": 280.00,
        "currency": "BDT",
        "delivery_date": (date.today() + timedelta(days=40)).isoformat(),
        "sizes": ["28", "30", "32", "34", "36", "38"],
        "matrix": [
            {"color": "Vintage Indigo Wash", "quantities": {"28": 150, "30": 450, "32": 800, "34": 800, "36": 400, "38": 200}, "total": 2800, "unit_price": 1750.00},
            {"color": "Enzyme Acid Black", "quantities": {"28": 100, "30": 300, "32": 600, "34": 600, "36": 300, "38": 100}, "total": 2000, "unit_price": 1780.00},
        ],
        "total_quantity": 4800,
        "total_value": 8460000.00,
        "costing_breakdown": {
            "fabric_cost": 820.00,
            "trims_cost": 195.00,
            "cm_making_cost": 280.00,
            "wash_embellishment": 230.00,
            "commercial_freight": 55.00,
            "factory_margin": 170.00,
            "quoted_fob_price": 1750.00
        },
        "pom_specs": [
            {"pom_code": "POM-11", "name": "Waist Band Width", "base_m": 84.0, "tolerance": 1.0, "grading_step": 4.0},
            {"pom_code": "POM-12", "name": "Inseam Length", "base_m": 81.0, "tolerance": 1.0, "grading_step": 0.0},
            {"pom_code": "POM-13", "name": "Front Rise", "base_m": 26.5, "tolerance": 0.5, "grading_step": 1.0},
            {"pom_code": "POM-14", "name": "Leg Opening", "base_m": 18.0, "tolerance": 0.5, "grading_step": 0.8},
        ]
    },
    {
        "po_number": "PO-8823",
        "buyer_name": "PVH / Tommy Hilfiger",
        "style_code": "HOODIE-TERRY-03",
        "product_type": "Fleece Knitwear (Heavy Hoodie)",
        "fabric_type": "340 GSM 100% Cotton French Terry",
        "smv_minutes": 22.00,
        "target_efficiency_pct": 68.0,
        "cm_cost_per_piece": 220.00,
        "currency": "BDT",
        "delivery_date": (date.today() + timedelta(days=50)).isoformat(),
        "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
        "matrix": [
            {"color": "Royal Navy", "quantities": {"XS": 80, "S": 220, "M": 500, "L": 500, "XL": 220, "XXL": 80}, "total": 1600, "unit_price": 2200.00},
            {"color": "Heather Grey", "quantities": {"XS": 70, "S": 200, "M": 450, "L": 450, "XL": 200, "XXL": 70}, "total": 1440, "unit_price": 2200.00},
            {"color": "Crimson Red", "quantities": {"XS": 50, "S": 150, "M": 350, "L": 350, "XL": 150, "XXL": 50}, "total": 1100, "unit_price": 2250.00},
        ],
        "total_quantity": 4140,
        "total_value": 9161000.00,
        "costing_breakdown": {
            "fabric_cost": 1020.00,
            "trims_cost": 250.00,
            "cm_making_cost": 220.00,
            "wash_embellishment": 140.00,
            "commercial_freight": 70.00,
            "factory_margin": 500.00,
            "quoted_fob_price": 2200.00
        },
        "pom_specs": [
            {"pom_code": "POM-21", "name": "Hood Height & Depth", "base_m": 38.0, "tolerance": 0.5, "grading_step": 1.0},
            {"pom_code": "POM-22", "name": "Kangaroo Pocket Width", "base_m": 32.0, "tolerance": 0.5, "grading_step": 1.5},
            {"pom_code": "POM-23", "name": "Bottom Rib Width", "base_m": 48.0, "tolerance": 1.0, "grading_step": 2.0},
        ]
    },
    {
        "po_number": "PO-8824",
        "buyer_name": "Marks & Spencer PLC",
        "style_code": "SHIRT-LINEN-04",
        "product_type": "Woven Tops (Pure Linen Shirt)",
        "fabric_type": "165 GSM 100% Washed Linen Plain Weave",
        "smv_minutes": 20.40,
        "target_efficiency_pct": 62.0,
        "cm_cost_per_piece": 200.00,
        "currency": "BDT",
        "delivery_date": (date.today() + timedelta(days=60)).isoformat(),
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "matrix": [
            {"color": "Optic White", "quantities": {"S": 200, "M": 450, "L": 450, "XL": 250, "XXL": 100}, "total": 1450, "unit_price": 1500.00},
            {"color": "Sky Chambray", "quantities": {"S": 180, "M": 400, "L": 400, "XL": 220, "XXL": 80}, "total": 1280, "unit_price": 1530.00},
        ],
        "total_quantity": 2730,
        "total_value": 4133400.00,
        "costing_breakdown": {
            "fabric_cost": 750.00,
            "trims_cost": 140.00,
            "cm_making_cost": 200.00,
            "wash_embellishment": 70.00,
            "commercial_freight": 40.00,
            "factory_margin": 300.00,
            "quoted_fob_price": 1500.00
        },
        "pom_specs": [
            {"pom_code": "POM-31", "name": "Collar Band Circumference", "base_m": 41.0, "tolerance": 0.5, "grading_step": 1.5},
            {"pom_code": "POM-32", "name": "Cuff Circumference", "base_m": 24.0, "tolerance": 0.5, "grading_step": 1.0},
        ]
    },
    {
        "po_number": "PO-8825",
        "buyer_name": "Target Corporation",
        "style_code": "CHINO-SHORT-05",
        "product_type": "Casual Bottoms (Stretch Shorts)",
        "fabric_type": "240 GSM Cotton Spandex Stretch Twill",
        "smv_minutes": 16.50,
        "target_efficiency_pct": 70.0,
        "cm_cost_per_piece": 135.00,
        "currency": "BDT",
        "delivery_date": (date.today() + timedelta(days=70)).isoformat(),
        "sizes": ["30", "32", "34", "36", "38"],
        "matrix": [
            {"color": "Sand Dune Khaki", "quantities": {"30": 350, "32": 650, "34": 650, "36": 350, "38": 150}, "total": 2150, "unit_price": 1180.00},
            {"color": "Washed Olive", "quantities": {"30": 300, "32": 600, "34": 600, "36": 300, "38": 100}, "total": 1900, "unit_price": 1180.00},
        ],
        "total_quantity": 4050,
        "total_value": 4779000.00,
        "costing_breakdown": {
            "fabric_cost": 550.00,
            "trims_cost": 130.00,
            "cm_making_cost": 135.00,
            "wash_embellishment": 85.00,
            "commercial_freight": 40.00,
            "factory_margin": 240.00,
            "quoted_fob_price": 1180.00
        },
        "pom_specs": [
            {"pom_code": "POM-41", "name": "Outseam Length", "base_m": 50.0, "tolerance": 1.0, "grading_step": 1.0},
            {"pom_code": "POM-42", "name": "Leg Opening", "base_m": 27.0, "tolerance": 0.5, "grading_step": 1.0},
        ]
    },
    {
        "po_number": "PO-8826",
        "buyer_name": "Uniqlo / Fast Retailing",
        "style_code": "JACKET-PUFF-06",
        "product_type": "Outerwear (Light Quilted Jacket)",
        "fabric_type": "380T Nylon Ripstop + 120 GSM Synthetic Down",
        "smv_minutes": 31.00,
        "target_efficiency_pct": 58.0,
        "cm_cost_per_piece": 380.00,
        "currency": "BDT",
        "delivery_date": (date.today() + timedelta(days=85)).isoformat(),
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "matrix": [
            {"color": "Matte Jet Black", "quantities": {"S": 250, "M": 600, "L": 600, "XL": 300, "XXL": 150}, "total": 1900, "unit_price": 2900.00},
            {"color": "Deep Slate Navy", "quantities": {"S": 200, "M": 500, "L": 500, "XL": 250, "XXL": 100}, "total": 1550, "unit_price": 2900.00},
        ],
        "total_quantity": 3450,
        "total_value": 10005000.00,
        "costing_breakdown": {
            "fabric_cost": 1350.00,
            "trims_cost": 340.00,
            "cm_making_cost": 380.00,
            "wash_embellishment": 110.00,
            "commercial_freight": 90.00,
            "factory_margin": 630.00,
            "quoted_fob_price": 2900.00
        },
        "pom_specs": [
            {"pom_code": "POM-51", "name": "Baffle Channel Spacing", "base_m": 8.0, "tolerance": 0.2, "grading_step": 0.0},
            {"pom_code": "POM-52", "name": "Chest Circumference", "base_m": 116.0, "tolerance": 1.0, "grading_step": 4.0},
        ]
    }
]


def get_matrix_orders() -> List[Dict[str, Any]]:
    return DEMO_MATRIX_ORDERS


def calculate_costing_sheet(
    garment_type: str,
    fabric_unit_cost: float,
    fabric_consumption: float,
    smv_minutes: float,
    line_minute_cost: float = 5.50,
    expected_efficiency_pct: float = 65.0,
    trims_cost: float = 105.00,
    wash_cost: float = 50.00,
    margin_pct: float = 10.0,
) -> Dict[str, Any]:
    fabric_total = fabric_unit_cost * fabric_consumption
    cm_cost = (smv_minutes * line_minute_cost) / (expected_efficiency_pct / 100.0)
    subtotal = fabric_total + trims_cost + cm_cost + wash_cost
    commercial = subtotal * 0.03
    base_cost = subtotal + commercial
    profit = base_cost * (margin_pct / 100.0)
    quoted_price = base_cost + profit

    return {
        "fabric_cost": round(fabric_total, 2),
        "trims_cost": round(trims_cost, 2),
        "cm_cost": round(cm_cost, 2),
        "wash_embellishment_cost": round(wash_cost, 2),
        "commercial_cost": round(commercial, 2),
        "profit_margin": round(profit, 2),
        "total_fob_quote": round(quoted_price, 2),
        "cm_margin_rate": f"৳{round(cm_cost, 2)}/pc (at {expected_efficiency_pct}% efficiency)"
    }


# ==============================================================================
# 2. FABRIC ROLLS & 4-POINT INSPECTION (ASTM D5430)
# ==============================================================================
def seed_fabric_rolls_if_empty(db: Session):
    demo_rolls = [
        ("ROL-8821-001", "PO-8821", "100% Cotton Pique 220 GSM", "MIL-8910", "Lot A", 120.0, 58.0, 220, -2.8, -2.2, 1.1, 14.0, 6.0, "PASSED", "READY", 24, datetime.utcnow() - timedelta(hours=30)),
        ("ROL-8821-002", "PO-8821", "100% Cotton Pique 220 GSM", "MIL-8911", "Lot A", 115.0, 58.0, 222, -3.1, -2.5, 1.2, 18.0, 8.1, "PASSED", "READY", 24, datetime.utcnow() - timedelta(hours=28)),
        ("ROL-8821-003", "PO-8821", "100% Cotton Pique 220 GSM", "MIL-8912", "Lot B", 125.0, 60.0, 218, -4.2, -3.0, 1.4, 22.0, 9.2, "PASSED", "RELAXING", 24, datetime.utcnow() - timedelta(hours=14)),
        ("ROL-8821-004", "PO-8821", "100% Cotton Pique 220 GSM", "MIL-8913", "Lot B", 100.0, 58.0, 225, -3.5, -2.8, 1.8, 64.0, 33.1, "REJECTED", "REQUIRED", 24, None),
        ("ROL-8821-005", "PO-8821", "100% Cotton Pique 220 GSM", "MIL-8914", "Lot C", 130.0, 59.0, 221, -2.5, -2.0, 0.9, 12.0, 5.0, "PASSED", "READY", 24, datetime.utcnow() - timedelta(hours=36)),
        
        ("ROL-8822-001", "PO-8822", "12.5oz Cotton Elastane Denim", "TEX-4011", "Lot A", 90.0, 62.0, 420, -5.5, -1.8, 0.8, 16.0, 8.6, "PASSED", "READY", 12, datetime.utcnow() - timedelta(hours=16)),
        ("ROL-8822-002", "PO-8822", "12.5oz Cotton Elastane Denim", "TEX-4012", "Lot A", 95.0, 62.0, 418, -5.2, -1.9, 0.7, 14.0, 7.1, "PASSED", "READY", 12, datetime.utcnow() - timedelta(hours=18)),
        ("ROL-8822-003", "PO-8822", "12.5oz Cotton Elastane Denim", "TEX-4013", "Lot B", 88.0, 61.5, 425, -6.0, -2.2, 1.1, 20.0, 11.0, "PASSED", "RELAXING", 12, datetime.utcnow() - timedelta(hours=6)),
        ("ROL-8822-004", "PO-8822", "12.5oz Cotton Elastane Denim", "TEX-4014", "Lot B", 92.0, 62.0, 422, -5.8, -2.0, 1.0, 58.0, 30.5, "REJECTED", "REQUIRED", 12, None),

        ("ROL-8823-001", "PO-8823", "340 GSM French Terry Fleece", "FT-601", "Lot A", 80.0, 60.0, 342, -4.8, -3.5, 1.5, 18.0, 10.8, "PASSED", "READY", 36, datetime.utcnow() - timedelta(hours=40)),
        ("ROL-8823-002", "PO-8823", "340 GSM French Terry Fleece", "FT-602", "Lot A", 85.0, 60.0, 338, -4.5, -3.2, 1.4, 15.0, 8.5, "PASSED", "RELAXING", 36, datetime.utcnow() - timedelta(hours=20)),

        ("ROL-8824-001", "PO-8824", "165 GSM Pure Washed Linen", "LIN-201", "Lot A", 110.0, 54.0, 168, -2.0, -1.5, 0.5, 12.0, 5.9, "PASSED", "READY", 12, datetime.utcnow() - timedelta(hours=14)),
        ("ROL-8825-001", "PO-8825", "240 GSM Cotton Spandex Twill", "TWL-101", "Lot A", 100.0, 58.0, 242, -3.8, -2.8, 1.0, 16.0, 8.3, "PASSED", "READY", 24, datetime.utcnow() - timedelta(hours=26)),
        ("ROL-8826-001", "PO-8826", "380T Nylon Ripstop Shell", "NYL-501", "Lot A", 150.0, 60.0, 110, -0.5, -0.4, 0.2, 8.0, 2.6, "PASSED", "READY", 0, datetime.utcnow() - timedelta(hours=50)),
    ]

    for bcode, po, mat, s_roll, shade, length, width, gsm, sl, sw, tq, pts, score, status, r_stat, r_hrs, r_start in demo_rolls:
        existing = db.query(FabricRoll).filter(FabricRoll.roll_barcode == bcode).first()
        if not existing:
            roll = FabricRoll(
                roll_barcode=bcode,
                order_number=po,
                material_name=mat,
                supplier_roll_no=s_roll,
                shade_lot=shade,
                roll_length_yds=Decimal(str(length)),
                usable_width_in=Decimal(str(width)),
                gsm=gsm,
                shrinkage_length_pct=Decimal(str(sl)),
                shrinkage_width_pct=Decimal(str(sw)),
                torque_pct=Decimal(str(tq)),
                four_point_score=Decimal(str(pts)),
                points_per_100_sq_yds=Decimal(str(score)),
                inspection_status=status,
                relaxation_status=r_stat,
                relaxation_hours_required=r_hrs,
                relaxation_started_at=r_start,
                defects_json=json.dumps([{"type": "Slub / Thick Yarn", "count": 2, "points": 4}, {"type": "Hole / Drop Stitch", "count": 1, "points": 4}])
            )
            db.add(roll)
    db.commit()


def calculate_4point_score(defects: List[Dict[str, Any]], length_yds: float, width_inches: float) -> Dict[str, Any]:
    total_points = sum(d.get("points", 0) for d in defects)
    if length_yds <= 0 or width_inches <= 0:
        score = 0.0
    else:
        score = (total_points * 36.0 * 100.0) / (length_yds * width_inches)

    status = "PASSED" if score <= 28.0 else "REJECTED"
    return {
        "total_penalty_points": total_points,
        "points_per_100_sq_yds": round(score, 2),
        "threshold": 28.0,
        "status": status,
        "grade": "Grade A (Export Acceptable)" if status == "PASSED" else "Grade B (Quarantine / Debit Note)"
    }


def list_fabric_rolls(db: Session, order_number: Optional[str] = None) -> List[Dict[str, Any]]:
    seed_fabric_rolls_if_empty(db)
    query = db.query(FabricRoll)
    if order_number and order_number != "ALL":
        query = query.filter(FabricRoll.order_number == order_number)
    
    rolls = query.all()
    results = []
    now = datetime.utcnow()

    for r in rolls:
        remaining_relaxation_hours = 0
        if r.relaxation_status == "RELAXING" and r.relaxation_started_at:
            elapsed = (now - r.relaxation_started_at).total_seconds() / 3600.0
            remaining_relaxation_hours = max(0, round(r.relaxation_hours_required - elapsed, 1))

        results.append({
            "id": r.id,
            "roll_barcode": r.roll_barcode,
            "order_number": r.order_number,
            "material_name": r.material_name,
            "supplier_roll_no": r.supplier_roll_no,
            "shade_lot": r.shade_lot,
            "roll_length_yds": float(r.roll_length_yds),
            "usable_width_in": float(r.usable_width_in),
            "gsm": r.gsm,
            "shrinkage_length_pct": float(r.shrinkage_length_pct),
            "shrinkage_width_pct": float(r.shrinkage_width_pct),
            "torque_pct": float(r.torque_pct),
            "four_point_score": float(r.four_point_score),
            "points_per_100_sq_yds": float(r.points_per_100_sq_yds),
            "inspection_status": r.inspection_status,
            "relaxation_status": r.relaxation_status,
            "relaxation_hours_required": r.relaxation_hours_required,
            "remaining_relaxation_hours": remaining_relaxation_hours,
        })
    return results


# ==============================================================================
# 3. QUALITY ASSURANCE: DHU & AQL 2.5 AUDIT (ISO 2859-1)
# ==============================================================================
def seed_quality_audits_if_empty(db: Session):
    demo_audits = [
        ("QCA-2026-001", "PO-8821", "POLO-CLASSIC-01", "Line 04", "ENDLINE_100", 250, 238, 12, 0, 7, 5, 4.80, "2.5 Normal Level II", 125, 7, "PASS", "Chief Inspector Monir Hossain", [
            {"defect": "Skip Stitch", "count": 4, "severity": "Major", "category": "Stitching"},
            {"defect": "Broken Stitch", "count": 3, "severity": "Major", "category": "Stitching"},
            {"defect": "Loose Thread Ends", "count": 3, "severity": "Minor", "category": "Finishing"},
            {"defect": "Oil Spot", "count": 2, "severity": "Minor", "category": "Fabric"},
        ]),
        ("QCA-2026-002", "PO-8821", "POLO-CLASSIC-01", "Inspection Bay 02", "FINAL_AQL", 200, 196, 4, 0, 3, 1, 2.00, "2.5 Normal Level II", 200, 10, "PASS", "Buyer QA Representative (SGS)", [
            {"defect": "Uneven Placket Width", "count": 2, "severity": "Major", "category": "Workmanship"},
            {"defect": "Needle Thread Tension", "count": 1, "severity": "Major", "category": "Stitching"},
            {"defect": "Slight Shade Band", "count": 1, "severity": "Minor", "category": "Shading"},
        ]),
        ("QCA-2026-003", "PO-8822", "DENIM-SLIM-02", "Line 02", "INLINE_TRAFFIC", 180, 171, 9, 0, 5, 4, 5.00, "2.5 Normal Level II", 125, 7, "PASS", "Afroza Parvin (Inline QA)", [
            {"defect": "Wavy Topstitch along Yoke", "count": 3, "severity": "Major", "category": "Workmanship"},
            {"defect": "Coin Pocket Misalignment", "count": 2, "severity": "Major", "category": "Placement"},
            {"defect": "Loose Bartack at Belt Loop", "count": 4, "severity": "Minor", "category": "Stitching"},
        ]),
        ("QCA-2026-004", "PO-8822", "DENIM-SLIM-02", "Inspection Bay 01", "FINAL_AQL", 200, 192, 8, 0, 6, 2, 4.00, "2.5 Normal Level II", 200, 10, "PASS", "Bureau Veritas Inspector", [
            {"defect": "Enzyme Wash Tint Variation", "count": 4, "severity": "Major", "category": "Washing"},
            {"defect": "Button Shank Loose", "count": 2, "severity": "Major", "category": "Hardware"},
            {"defect": "Pocket Flap Uneven", "count": 2, "severity": "Minor", "category": "Workmanship"},
        ]),
        ("QCA-2026-005", "PO-8823", "HOODIE-TERRY-03", "Line 05", "INLINE_TRAFFIC", 150, 146, 4, 0, 3, 1, 2.67, "2.5 Normal Level II", 80, 5, "PASS", "Selim Reza (QA Auditor)", [
            {"defect": "Hood Drawcord Knot Uneven", "count": 2, "severity": "Major", "category": "Assembly"},
            {"defect": "Cuff Rib Puckering", "count": 1, "severity": "Major", "category": "Stitching"},
            {"defect": "Kangaroo Pocket Stitch Skip", "count": 1, "severity": "Minor", "category": "Stitching"},
        ]),
        ("QCA-2026-006", "PO-8824", "SHIRT-LINEN-04", "Cutting Table 03", "INLINE_TRAFFIC", 120, 118, 2, 0, 2, 0, 1.67, "1.5 High Precision", 80, 3, "PASS", "Chief Inspector Monir Hossain", [
            {"defect": "Collar Notch Displacement (1.5mm)", "count": 2, "severity": "Major", "category": "Cutting"},
        ]),
        ("QCA-2026-007", "PO-8825", "CHINO-SHORT-05", "Line 03", "ENDLINE_100", 220, 214, 6, 0, 4, 2, 2.73, "2.5 Normal Level II", 125, 7, "PASS", "Afroza Parvin (Inline QA)", [
            {"defect": "Zip Fly Topstitch Irregular", "count": 3, "severity": "Major", "category": "Stitching"},
            {"defect": "Slanted Slash Pocket", "count": 1, "severity": "Major", "category": "Assembly"},
            {"defect": "Excess Thread Tail", "count": 2, "severity": "Minor", "category": "Finishing"},
        ]),
        ("QCA-2026-008", "PO-8826", "JACKET-PUFF-06", "Inspection Bay 03", "FINAL_AQL", 200, 195, 5, 0, 4, 1, 2.50, "2.5 Normal Level II", 200, 10, "PASS", "Uniqlo Quality Assessor (SGS)", [
            {"defect": "Down Clumping at Left Baffle", "count": 2, "severity": "Major", "category": "Quilting"},
            {"defect": "Front Reverse Coil Zipper Catch", "count": 2, "severity": "Major", "category": "Hardware"},
            {"defect": "Hangtag Price Mismatch", "count": 1, "severity": "Minor", "category": "Packaging"},
        ]),
    ]

    for num, po, st, line, atype, total, passed, defs, crit, maj, minr, dhu, aql, sample, allowed, res, insp, dbreak in demo_audits:
        existing = db.query(QualityAudit).filter(QualityAudit.audit_number == num).first()
        if not existing:
            audit = QualityAudit(
                audit_number=num,
                order_number=po,
                style_code=st,
                line_number=line,
                audit_type=atype,
                total_inspected=total,
                total_passed=passed,
                total_defective=defs,
                critical_defects=crit,
                major_defects=maj,
                minor_defects=minr,
                dhu_score=Decimal(str(dhu)),
                aql_level=aql,
                sample_size=sample,
                allowed_defects=allowed,
                audit_result=res,
                inspector_name=insp,
                defects_breakdown_json=json.dumps(dbreak),
            )
            db.add(audit)
    db.commit()


def calculate_aql_standards(lot_size: int, aql_target: float = 2.5) -> Dict[str, Any]:
    if lot_size <= 500:
        sample_size = 50
        allowed = 3
    elif lot_size <= 1200:
        sample_size = 80
        allowed = 5
    elif lot_size <= 3200:
        sample_size = 125
        allowed = 7
    elif lot_size <= 10000:
        sample_size = 200
        allowed = 10
    else:
        sample_size = 315
        allowed = 14

    return {
        "lot_size": lot_size,
        "sample_size": sample_size,
        "inspection_level": "Level II Normal Single Sampling",
        "aql_target": aql_target,
        "acceptance_max": allowed,
        "rejection_min": allowed + 1,
        "rule": f"Sample {sample_size} garments. Pass if defects <= {allowed}; Reject entire lot if defects >= {allowed + 1}."
    }


def list_quality_audits(db: Session) -> List[Dict[str, Any]]:
    seed_quality_audits_if_empty(db)
    audits = db.query(QualityAudit).order_by(QualityAudit.id.desc()).all()
    results = []
    for a in audits:
        dbreak = []
        if a.defects_breakdown_json:
            try:
                dbreak = json.loads(a.defects_breakdown_json)
            except Exception:
                dbreak = []
        results.append({
            "id": a.id,
            "audit_number": a.audit_number,
            "order_number": a.order_number,
            "style_code": a.style_code,
            "line_number": a.line_number,
            "audit_type": a.audit_type,
            "total_inspected": a.total_inspected,
            "total_passed": a.total_passed,
            "total_defective": a.total_defective,
            "dhu_score": float(a.dhu_score),
            "aql_level": a.aql_level,
            "sample_size": a.sample_size,
            "allowed_defects": a.allowed_defects,
            "audit_result": a.audit_result,
            "inspector_name": a.inspector_name,
            "defects_breakdown": dbreak,
        })
    return results


# ==============================================================================
# 4. ASSORTED RATIO PACKING & CBM CONTAINER OPTIMIZER
# ==============================================================================
def seed_packing_plans_if_empty(db: Session):
    demo_plans = [
        ("PKP-8821-01", "PO-8821", "ASSORTED_RATIO", "XS:1, S:2, M:3, L:3, XL:2, XXL:1 (12 pcs/box)", 12, 388, 4, 60.0, 40.0, 30.0, 0.0720, 27.94, 4.80, 1862.40, "40FT_HC", 68.0, 41.08, {"solid_cartons": 0, "assorted_cartons": 388, "pallet_count": 18}),
        ("PKP-8822-01", "PO-8822", "SOLID_SIZE", "Solid Size Pack (10 Denim Jeans/box)", 10, 480, 0, 60.0, 40.0, 35.0, 0.0840, 40.32, 9.20, 4416.00, "40FT_HC", 68.0, 59.29, {"solid_cartons": 480, "assorted_cartons": 0, "pallet_count": 24}),
        ("PKP-8823-01", "PO-8823", "ASSORTED_RATIO", "S:2, M:3, L:3, XL:2 (10 Hoodies/box)", 10, 414, 0, 65.0, 45.0, 40.0, 0.1170, 48.44, 8.50, 3519.00, "40FT_HC", 68.0, 71.24, {"solid_cartons": 0, "assorted_cartons": 414, "pallet_count": 26}),
        ("PKP-8824-01", "PO-8824", "SOLID_SIZE", "Solid Pack (15 Shirts/box)", 15, 182, 0, 55.0, 38.0, 28.0, 0.0585, 10.65, 4.20, 764.40, "20FT_DRY", 28.0, 38.04, {"solid_cartons": 182, "assorted_cartons": 0, "pallet_count": 10}),
        ("PKP-8825-01", "PO-8825", "ASSORTED_RATIO", "Ratio 30:2, 32:4, 34:4, 36:2 (12 Shorts/box)", 12, 337, 6, 58.0, 38.0, 25.0, 0.0551, 18.57, 5.50, 1853.50, "40FT_DRY", 58.0, 32.02, {"solid_cartons": 0, "assorted_cartons": 337, "pallet_count": 14}),
    ]

    for pnum, po, ptype, formula, ppc, tot_c, res_l, l, w, h, cbm_pc, tot_cbm, gw_pc, tot_gw, ctype, max_cbm, util, cdetail in demo_plans:
        existing = db.query(PackingPlan).filter(PackingPlan.plan_number == pnum).first()
        if not existing:
            plan = PackingPlan(
                plan_number=pnum,
                order_number=po,
                pack_type=ptype,
                ratio_formula=formula,
                pieces_per_carton=ppc,
                total_cartons=tot_c,
                residual_loose_pieces=res_l,
                carton_length_cm=Decimal(str(l)),
                carton_width_cm=Decimal(str(w)),
                carton_height_cm=Decimal(str(h)),
                cbm_per_carton=Decimal(str(cbm_pc)),
                total_shipment_cbm=Decimal(str(tot_cbm)),
                gross_weight_per_carton_kg=Decimal(str(gw_pc)),
                total_gross_weight_kg=Decimal(str(tot_gw)),
                container_type=ctype,
                container_max_cbm=Decimal(str(max_cbm)),
                container_utilization_pct=Decimal(str(util)),
                cartons_detail_json=json.dumps(cdetail),
            )
            db.add(plan)
    db.commit()


def calculate_carton_packing(
    total_garments: int,
    pieces_per_carton: int = 12,
    length_cm: float = 60.0,
    width_cm: float = 40.0,
    height_cm: float = 30.0,
    garment_weight_kg: float = 0.32,
    carton_tare_weight_kg: float = 0.95,
    container_type: str = "40FT_HC",
) -> Dict[str, Any]:
    total_cartons = total_garments // pieces_per_carton
    loose_pieces = total_garments % pieces_per_carton
    
    cbm_per_carton = (length_cm * width_cm * height_cm) / 1000000.0
    total_cbm = total_cartons * cbm_per_carton

    carton_gross_weight = (pieces_per_carton * garment_weight_kg) + carton_tare_weight_kg
    total_gross_weight = (total_cartons * carton_gross_weight) + (loose_pieces * garment_weight_kg)

    container_capacities = {
        "20FT_DRY": 28.0,
        "40FT_DRY": 58.0,
        "40FT_HC": 68.0,
    }
    max_cbm = container_capacities.get(container_type, 68.0)
    utilization_pct = min(100.0, (total_cbm / max_cbm) * 100.0)

    return {
        "total_cartons": total_cartons,
        "loose_pieces": loose_pieces,
        "pieces_per_carton": pieces_per_carton,
        "cbm_per_carton": round(cbm_per_carton, 4),
        "total_cbm": round(total_cbm, 2),
        "gross_weight_per_carton_kg": round(carton_gross_weight, 2),
        "total_gross_weight_kg": round(total_gross_weight, 2),
        "container_type": container_type,
        "container_max_cbm": max_cbm,
        "container_utilization_pct": round(utilization_pct, 1),
    }


def list_packing_plans(db: Session) -> List[Dict[str, Any]]:
    seed_packing_plans_if_empty(db)
    plans = db.query(PackingPlan).all()
    results = []
    for p in plans:
        results.append({
            "id": p.id,
            "plan_number": p.plan_number,
            "order_number": p.order_number,
            "pack_type": p.pack_type,
            "ratio_formula": p.ratio_formula,
            "pieces_per_carton": p.pieces_per_carton,
            "total_cartons": p.total_cartons,
            "residual_loose_pieces": p.residual_loose_pieces,
            "carton_dimensions": f"{p.carton_length_cm}x{p.carton_width_cm}x{p.carton_height_cm} cm",
            "cbm_per_carton": float(p.cbm_per_carton),
            "total_shipment_cbm": float(p.total_shipment_cbm),
            "gross_weight_per_carton_kg": float(p.gross_weight_per_carton_kg),
            "total_gross_weight_kg": float(p.total_gross_weight_kg),
            "container_type": p.container_type,
            "container_utilization_pct": float(p.container_utilization_pct),
        })
    return results


# ==============================================================================
# 5. CRITICAL PATH T&A (DAG ENGINE)
# ==============================================================================
def seed_critical_path_tna_if_empty(db: Session):
    today = date.today()
    demo_cpm = [
        ("PO-8821", "M-01", "Order Confirmation & Tech Pack Bulk Sign-off", None, 3, today - timedelta(days=20), today - timedelta(days=17), today - timedelta(days=20), today - timedelta(days=17), 0, True, "COMPLETED", "Merchandiser"),
        ("PO-8821", "M-02", "Lab Dip & Shade Option Approval", "M-01", 7, today - timedelta(days=17), today - timedelta(days=10), today - timedelta(days=17), today - timedelta(days=8), -2, True, "COMPLETED", "Dyeing Master"),
        ("PO-8821", "M-03", "Bulk Fabric In-House & 4-Point Inspection", "M-02", 10, today - timedelta(days=8), today + timedelta(days=2), today - timedelta(days=8), None, 0, True, "ON_TRACK", "Fabric Warehouse In-charge"),
        ("PO-8821", "M-04", "Fabric Relaxation (24h) & Pilot Cutting", "M-03", 2, today + timedelta(days=2), today + timedelta(days=4), None, None, 0, True, "ON_TRACK", "Cutting Master"),
        ("PO-8821", "M-05", "Bulk Sewing Line Loading", "M-04", 12, today + timedelta(days=4), today + timedelta(days=16), None, None, 0, True, "ON_TRACK", "Production Manager"),
        ("PO-8821", "M-06", "Garment Wet Wash & Finishing", "M-05", 4, today + timedelta(days=16), today + timedelta(days=20), None, None, 0, True, "ON_TRACK", "Finishing Supervisor"),
        ("PO-8821", "M-07", "Final Pre-Shipment AQL 2.5 Audit", "M-06", 2, today + timedelta(days=20), today + timedelta(days=22), None, None, 0, True, "ON_TRACK", "Quality Manager"),
        ("PO-8821", "M-08", "Vessel Cargo Handover (Ex-Factory)", "M-07", 3, today + timedelta(days=22), today + timedelta(days=25), None, None, 0, True, "ON_TRACK", "Commercial / Logistics Head"),

        ("PO-8822", "M-01", "Zara Master Pattern Approval & PP Sample", None, 5, today - timedelta(days=15), today - timedelta(days=10), today - timedelta(days=15), today - timedelta(days=10), 0, True, "COMPLETED", "Sr. Merchandiser"),
        ("PO-8822", "M-02", "Denim Mill Weaving & Rope Dyeing Completion", "M-01", 12, today - timedelta(days=10), today + timedelta(days=2), today - timedelta(days=10), None, 0, True, "ON_TRACK", "Supply Chain Lead"),
        ("PO-8822", "M-03", "Bulk Cutting & Automated Pocket Creasing", "M-02", 5, today + timedelta(days=2), today + timedelta(days=7), None, None, 0, True, "ON_TRACK", "Cutting Supervisor"),
        ("PO-8822", "M-04", "Heavy Denim Sewing Line Assembly", "M-03", 15, today + timedelta(days=7), today + timedelta(days=22), None, None, 0, True, "ON_TRACK", "Line Supervisor"),
        ("PO-8822", "M-05", "Enzyme Stone Wash & Potassium Spraying", "M-04", 8, today + timedelta(days=22), today + timedelta(days=30), None, None, 0, True, "ON_TRACK", "Washing GM"),
        ("PO-8822", "M-06", "Ex-Factory Dispatch via Chittagong Port", "M-05", 5, today + timedelta(days=30), today + timedelta(days=35), None, None, 0, True, "ON_TRACK", "Commercial Head"),
    ]

    for po, code, name, pred, ldays, p_start, p_end, a_start, a_end, flt, crit, stat, resp in demo_cpm:
        existing = db.query(CriticalPathMilestone).filter(
            CriticalPathMilestone.order_number == po,
            CriticalPathMilestone.milestone_code == code,
        ).first()
        if not existing:
            m = CriticalPathMilestone(
                order_number=po,
                milestone_code=code,
                milestone_name=name,
                predecessor_code=pred,
                lead_days=ldays,
                planned_start=p_start,
                planned_end=p_end,
                actual_start=a_start,
                actual_end=a_end,
                float_days=flt,
                is_critical=crit,
                status=stat,
                responsible_role=resp,
            )
            db.add(m)
    db.commit()


def list_critical_path_milestones(db: Session, order_number: str = "PO-8821") -> List[Dict[str, Any]]:
    seed_critical_path_tna_if_empty(db)
    milestones = db.query(CriticalPathMilestone).filter(CriticalPathMilestone.order_number == order_number).all()
    results = []
    for m in milestones:
        results.append({
            "id": m.id,
            "order_number": m.order_number,
            "milestone_code": m.milestone_code,
            "milestone_name": m.milestone_name,
            "predecessor_code": m.predecessor_code,
            "lead_days": m.lead_days,
            "planned_start": m.planned_start.isoformat(),
            "planned_end": m.planned_end.isoformat(),
            "actual_start": m.actual_start.isoformat() if m.actual_start else None,
            "actual_end": m.actual_end.isoformat() if m.actual_end else None,
            "float_days": m.float_days,
            "is_critical": m.is_critical,
            "status": m.status,
            "responsible_role": m.responsible_role,
        })
    return results


# ==============================================================================
# 6. COMMERCIAL EXIM: MASTER LC & JOB COST VARIANCE (ALL IN BDT ৳)
# ==============================================================================
def seed_commercial_lcs_if_empty(db: Session):
    today = date.today()
    demo_lcs = [
        ("MLC-2026-HM-9901", "PO-8821", "H&M Hennes & Mauritz GBC AB", 3844400.00, "City Bank Ltd (Dhaka)", 60, 30, [
            {"b2b_lc_no": "B2B-YRN-001", "supplier": "Aman Spinning Mills", "material": "30s/1 Combed Cotton Yarn", "value": 1350000.00, "status": "Active"},
            {"b2b_lc_no": "B2B-FAB-002", "supplier": "Square Textiles Ltd", "material": "Knitting & Dyeing Charges", "value": 585000.00, "status": "Active"},
            {"b2b_lc_no": "B2B-TRM-003", "supplier": "YKK Fastening Systems", "material": "Buttons & Pearl Plackets", "value": 375000.00, "status": "Active"},
        ], [
            {"element": "Fabric Raw Material", "budgeted": 1942000.00, "actual": 1985000.00, "variance": 43000.00, "status": "UNFAVORABLE", "reason": "Slightly higher cutting end-loss"},
            {"element": "Sewing Trims & Labels", "budgeted": 489000.00, "actual": 480000.00, "variance": -9000.00, "status": "FAVORABLE", "reason": "Bulk supplier discount"},
            {"element": "Sewing CM (Labor & Overhead)", "budgeted": 699000.00, "actual": 745000.00, "variance": 46000.00, "status": "UNFAVORABLE", "reason": "Initial line efficiency learning curve at 58% vs 65% target"},
            {"element": "Washing & Embellishment", "budgeted": 233000.00, "actual": 233000.00, "variance": 0.00, "status": "ON_BUDGET", "reason": "Fixed contract rate"},
            {"element": "Commercial & Inland Freight", "budgeted": 139000.00, "actual": 145000.00, "variance": 6000.00, "status": "UNFAVORABLE", "reason": "Dhaka-Chittagong fuel surcharge"},
        ]),
        ("MLC-2026-ZR-4412", "PO-8822", "Zara / Inditex Group", 8460000.00, "Eastern Bank Ltd (Gulshan Branch)", 75, 45, [
            {"b2b_lc_no": "B2B-DNM-101", "supplier": "Pioneer Denim Mills", "material": "12.5oz Ring Spun Denim", "value": 3950000.00, "status": "Active"},
            {"b2b_lc_no": "B2B-TRM-102", "supplier": "YKK Bangladesh", "material": "Metal Zippers & Rivets", "value": 930000.00, "status": "Active"},
        ], [
            {"element": "Denim Fabric", "budgeted": 3936000.00, "actual": 3910000.00, "variance": -26000.00, "status": "FAVORABLE", "reason": "CAD Marker efficiency +1.2%"},
            {"element": "Enzyme Wash Chemistry", "budgeted": 1104000.00, "actual": 1104000.00, "variance": 0.00, "status": "ON_BUDGET", "reason": "Standard recipe"},
        ]),
        ("MLC-2026-PVH-7720", "PO-8823", "PVH / Tommy Hilfiger", 9161000.00, "Standard Chartered Bank Bangladesh", 90, 50, [
            {"b2b_lc_no": "B2B-FT-201", "supplier": "Square Textiles Ltd", "material": "French Terry Brushed Fleece", "value": 4250000.00, "status": "Active"},
        ], [
            {"element": "Fleece Fabric", "budgeted": 4220000.00, "actual": 4225000.00, "variance": 5000.00, "status": "ON_BUDGET", "reason": "In line with spec"},
        ]),
    ]

    for mlc_num, po, buyer, val, bank, exp_days, ship_days, b2b_list, cost_vars in demo_lcs:
        existing = db.query(CommercialLC).filter(CommercialLC.master_lc_number == mlc_num).first()
        if not existing:
            total_b2b = sum(x["value"] for x in b2b_list)
            budget_tot = sum(x["budgeted"] for x in cost_vars)
            actual_tot = sum(x["actual"] for x in cost_vars)

            lc = CommercialLC(
                master_lc_number=mlc_num,
                order_number=po,
                buyer_name=buyer,
                lc_value=Decimal(str(val)),
                currency="BDT",
                issuing_bank=bank,
                expiry_date=today + timedelta(days=exp_days),
                latest_shipment_date=today + timedelta(days=ship_days),
                max_b2b_allowed_pct=Decimal("75.00"),
                total_b2b_opened=Decimal(str(total_b2b)),
                b2b_utilization_pct=Decimal(str(round((total_b2b / val) * 100, 2))),
                b2b_ledger_json=json.dumps(b2b_list),
                budgeted_cost=Decimal(str(budget_tot)),
                actual_cost=Decimal(str(actual_tot)),
                variance_amount=Decimal(str(actual_tot - budget_tot)),
                variance_status="UNFAVORABLE" if actual_tot > budget_tot else "FAVORABLE",
                cost_variance_json=json.dumps(cost_vars),
            )
            db.add(lc)
    db.commit()


def list_commercial_records(db: Session) -> List[Dict[str, Any]]:
    seed_commercial_lcs_if_empty(db)
    lcs = db.query(CommercialLC).all()
    results = []
    for l in lcs:
        b2b = []
        if l.b2b_ledger_json:
            try:
                b2b = json.loads(l.b2b_ledger_json)
            except Exception:
                b2b = []
        var_data = []
        if l.cost_variance_json:
            try:
                var_data = json.loads(l.cost_variance_json)
            except Exception:
                var_data = []

        results.append({
            "id": l.id,
            "master_lc_number": l.master_lc_number,
            "order_number": l.order_number,
            "buyer_name": l.buyer_name,
            "lc_value": float(l.lc_value),
            "currency": l.currency,
            "issuing_bank": l.issuing_bank,
            "expiry_date": l.expiry_date.isoformat(),
            "latest_shipment_date": l.latest_shipment_date.isoformat(),
            "max_b2b_allowed_pct": float(l.max_b2b_allowed_pct),
            "total_b2b_opened": float(l.total_b2b_opened),
            "b2b_utilization_pct": float(l.b2b_utilization_pct),
            "b2b_ledger": b2b,
            "budgeted_cost": float(l.budgeted_cost),
            "actual_cost": float(l.actual_cost),
            "variance_amount": float(l.variance_amount),
            "variance_status": l.variance_status,
            "cost_variance": var_data,
        })
    return results


# ==============================================================================
# 7. WORKFORCE COMPENSATION & PIECE-RATE PAYROLL ENGINE (ALL IN BDT ৳)
# ==============================================================================
def seed_payroll_records_if_empty(db: Session):
    demo_workers = [
        # Sewing Floor Operators (Piece-Rate in BDT ৳)
        ("EMP-401", "Fatima Begum", "Sewing Floor", "Senior Overlock Operator", "Grade A", "PIECE_RATE",
         14500.00, 9250.00, 1850, 22.0, 3300.00, 2500.00, 1500.00, 31050.00, 500.00, 30550.00, "PAID", "October 2026",
         [{"operation": "Collar Setting & Hemming", "bundles": 92, "pieces": 1850, "rate": 5.00, "total": 9250.00}]),

        ("EMP-402", "Nasrin Akter", "Sewing Floor", "Flatlock Topstitch Specialist", "Grade A", "PIECE_RATE",
         14500.00, 11000.00, 2200, 20.0, 3000.00, 2500.00, 1500.00, 32500.00, 500.00, 32000.00, "PAID", "October 2026",
         [{"operation": "Sleeve Cuff Overlock & Topstitch", "bundles": 110, "pieces": 2200, "rate": 5.00, "total": 11000.00}]),

        ("EMP-403", "Rokeya Sultana", "Sewing Floor", "Single Needle Lockstitch Operator", "Grade B", "PIECE_RATE",
         13500.00, 7500.00, 2500, 16.0, 2400.00, 1800.00, 1500.00, 26700.00, 500.00, 26200.00, "PAID", "October 2026",
         [{"operation": "Placket Box & Button Hole Stitching", "bundles": 100, "pieces": 2500, "rate": 3.00, "total": 7500.00}]),

        ("EMP-404", "Shirin Akter", "Sewing Floor", "Side Seam & Bottom Hem Operator", "Grade B", "PIECE_RATE",
         13500.00, 7250.00, 2900, 18.0, 2700.00, 1800.00, 1500.00, 26750.00, 500.00, 26250.00, "APPROVED", "October 2026",
         [{"operation": "4-Thread Overlock Side Seam Join", "bundles": 116, "pieces": 2900, "rate": 2.50, "total": 7250.00}]),

        ("EMP-405", "Bilkis Banu", "Sewing Floor", "Twin Needle Feed-Off-Arm Operator", "Grade A", "PIECE_RATE",
         15000.00, 9750.00, 1950, 24.0, 3600.00, 2500.00, 1500.00, 32350.00, 500.00, 31850.00, "PAID", "October 2026",
         [{"operation": "Denim Inseam & Yoke Chain Stitching", "bundles": 98, "pieces": 1950, "rate": 5.00, "total": 9750.00}]),

        ("EMP-406", "Jahanara Khatun", "Sewing Floor", "Pocket Setter & Bartack Specialist", "Grade A", "PIECE_RATE",
         14500.00, 9800.00, 2800, 20.0, 3000.00, 2000.00, 1500.00, 30800.00, 500.00, 30300.00, "APPROVED", "October 2026",
         [{"operation": "Back Pocket Auto-Pattern Setting", "bundles": 112, "pieces": 2800, "rate": 3.50, "total": 9800.00}]),

        # Cutting Room Staff (BDT ৳)
        ("EMP-407", "Kamal Hossain", "Cutting Room", "Chief Cutting Master", "Grade A", "FIXED_SALARY",
         35000.00, 0.00, 0, 15.0, 4500.00, 4000.00, 1500.00, 45000.00, 500.00, 44500.00, "PAID", "October 2026",
         [{"duty": "Monthly CAD marker planning & CNC knife maintenance", "pieces": 0, "rate": 0, "total": 0}]),

        ("EMP-408", "Jamal Uddin", "Cutting Room", "Automatic Fabric Spreader Operator", "Grade B", "PIECE_RATE",
         14000.00, 6500.00, 2600, 14.0, 2100.00, 1500.00, 1500.00, 25600.00, 500.00, 25100.00, "PAID", "October 2026",
         [{"operation": "Fabric Roll Spreading & Ply Stacking", "bundles": 130, "pieces": 2600, "rate": 2.50, "total": 6500.00}]),

        ("EMP-409", "Tariq Mia", "Cutting Room", "Precision Bandknife Cutter", "Grade A", "PIECE_RATE",
         15500.00, 8500.00, 3400, 18.0, 2700.00, 2500.00, 1500.00, 30700.00, 500.00, 30200.00, "APPROVED", "October 2026",
         [{"operation": "Bandknife Contour Small Part Cutting", "bundles": 170, "pieces": 3400, "rate": 2.50, "total": 8500.00}]),

        # Quality Assurance (BDT ৳)
        ("EMP-410", "Monir Hossain", "Quality Assurance", "Chief Quality Inspector", "Grade A", "FIXED_SALARY",
         30000.00, 0.00, 0, 10.0, 3000.00, 3500.00, 1500.00, 38000.00, 500.00, 37500.00, "PAID", "October 2026",
         [{"duty": "AQL 2.5 Pre-Shipment Audit & End-Line DHU Management", "pieces": 0, "rate": 0, "total": 0}]),

        ("EMP-411", "Afroza Parvin", "Quality Assurance", "End-Line 100% Quality Auditor", "Grade B", "FIXED_SALARY",
         19500.00, 0.00, 0, 12.0, 2400.00, 2000.00, 1500.00, 25400.00, 500.00, 24900.00, "PAID", "October 2026",
         [{"duty": "Table 04 Defect Measurement & Garment Spec Check", "pieces": 0, "rate": 0, "total": 0}]),

        ("EMP-412", "Selim Reza", "Quality Assurance", "Raw Material 4-Point Fabric Inspector", "Grade B", "FIXED_SALARY",
         20000.00, 0.00, 0, 10.0, 2000.00, 2000.00, 1500.00, 25500.00, 500.00, 25000.00, "APPROVED", "October 2026",
         [{"duty": "ASTM D5430 Fabric Roll 4-Point System Auditing", "pieces": 0, "rate": 0, "total": 0}]),

        # Finishing & Packaging (BDT ৳)
        ("EMP-413", "Rafiqul Islam", "Finishing", "Steam Presser / Ironing", "Grade B", "PIECE_RATE",
         13500.00, 7750.00, 3100, 18.0, 2700.00, 0.00, 1500.00, 25450.00, 500.00, 24950.00, "APPROVED", "October 2026",
         [{"operation": "Final Garment Steam Press & Tagging", "bundles": 155, "pieces": 3100, "rate": 2.50, "total": 7750.00}]),

        ("EMP-414", "Anowar Hossain", "Finishing", "Thread Trimmer & Spot Cleaner", "Grade C", "PIECE_RATE",
         12500.00, 6400.00, 3200, 12.0, 1800.00, 1200.00, 1500.00, 23400.00, 500.00, 22900.00, "PAID", "October 2026",
         [{"operation": "Garment Thread Sucking & Loose Trimming", "bundles": 160, "pieces": 3200, "rate": 2.00, "total": 6400.00}]),

        ("EMP-415", "Morium Begum", "Finishing", "Carton Packing & Barcode Scanner", "Grade B", "PIECE_RATE",
         13500.00, 6750.00, 2700, 16.0, 2400.00, 1800.00, 1500.00, 25950.00, 500.00, 25450.00, "PAID", "October 2026",
         [{"operation": "Polybag Folding, Ratio Sorting & Carton Stuffing", "bundles": 135, "pieces": 2700, "rate": 2.50, "total": 6750.00}]),

        # Maintenance & Engineering (BDT ৳)
        ("EMP-416", "Abul Bashar", "Maintenance", "Senior Sewing Machine Technician", "Grade A", "FIXED_SALARY",
         32000.00, 0.00, 0, 18.0, 4500.00, 3500.00, 1500.00, 41500.00, 500.00, 41000.00, "PAID", "October 2026",
         [{"duty": "Juki & Brother Automatic Machine Calibration & Preventive Maintenance", "pieces": 0, "rate": 0, "total": 0}]),

        ("EMP-417", "Zahirul Haque", "Maintenance", "Pneumatics & Steam Boiler Engineer", "Grade A", "FIXED_SALARY",
         34000.00, 0.00, 0, 14.0, 3500.00, 3000.00, 1500.00, 42000.00, 500.00, 41500.00, "APPROVED", "October 2026",
         [{"duty": "Steam line pressure regulation & Central Vacuum pump upkeep", "pieces": 0, "rate": 0, "total": 0}]),

        ("EMP-418", "Parvin Sultana", "Sewing Floor", "Junior Helper / Bundle Feeder", "Grade C", "PIECE_RATE",
         12000.00, 4750.00, 1900, 10.0, 1500.00, 1000.00, 1500.00, 20750.00, 500.00, 20250.00, "PENDING", "October 2026",
         [{"operation": "Parts Matching & Line Bundle Distribution", "bundles": 95, "pieces": 1900, "rate": 2.50, "total": 4750.00}]),
    ]

    for code, name, dept, desig, grp, stype, base, piece, ops, ot_h, ot_p, bonus, att, gross, ded, net, stat, mth, bdown in demo_workers:
        existing = db.query(EmployeeSalaryRecord).filter(EmployeeSalaryRecord.employee_code == code).first()
        if not existing:
            rec = EmployeeSalaryRecord(
                employee_code=code,
                full_name=name,
                department=dept,
                designation=desig,
                skill_grade=grp,
                salary_type=stype,
                base_salary=Decimal(str(base)),
                piece_rate_earnings=Decimal(str(piece)),
                operations_completed_count=ops,
                overtime_hours=Decimal(str(ot_h)),
                overtime_pay=Decimal(str(ot_p)),
                efficiency_bonus=Decimal(str(bonus)),
                attendance_allowance=Decimal(str(att)),
                gross_earnings=Decimal(str(gross)),
                deductions=Decimal(str(ded)),
                net_payable_salary=Decimal(str(net)),
                payment_status=stat,
                month_year=mth,
                breakdown_json=json.dumps(bdown),
            )
            db.add(rec)
    db.commit()


def list_payroll_records(db: Session, department: Optional[str] = None) -> List[Dict[str, Any]]:
    seed_payroll_records_if_empty(db)
    query = db.query(EmployeeSalaryRecord)
    if department and department != "ALL":
        query = query.filter(EmployeeSalaryRecord.department == department)
    
    records = query.order_by(EmployeeSalaryRecord.id.asc()).all()
    results = []
    for r in records:
        bdown = []
        if r.breakdown_json:
            try:
                bdown = json.loads(r.breakdown_json)
            except Exception:
                bdown = []
        results.append({
            "id": r.id,
            "employee_code": r.employee_code,
            "full_name": r.full_name,
            "department": r.department,
            "designation": r.designation,
            "skill_grade": r.skill_grade,
            "salary_type": r.salary_type,
            "base_salary": float(r.base_salary),
            "piece_rate_earnings": float(r.piece_rate_earnings),
            "operations_completed_count": r.operations_completed_count,
            "overtime_hours": float(r.overtime_hours),
            "overtime_pay": float(r.overtime_pay),
            "efficiency_bonus": float(r.efficiency_bonus),
            "attendance_allowance": float(r.attendance_allowance),
            "gross_earnings": float(r.gross_earnings),
            "deductions": float(r.deductions),
            "net_payable_salary": float(r.net_payable_salary),
            "payment_status": r.payment_status,
            "month_year": r.month_year,
            "breakdown": bdown,
        })
    return results


def calculate_piece_rate_pay(
    base_salary: float = 14500.0,
    pieces_completed: int = 1850,
    rate_per_piece: float = 5.0,
    overtime_hours: float = 20.0,
    hourly_ot_rate: float = 150.0,
    efficiency_bonus: float = 2500.0,
    attendance_allowance: float = 1500.0,
    deductions: float = 500.0,
) -> Dict[str, Any]:
    piece_earnings = pieces_completed * rate_per_piece
    ot_pay = overtime_hours * hourly_ot_rate
    gross = base_salary + piece_earnings + ot_pay + efficiency_bonus + attendance_allowance
    net = max(0.0, gross - deductions)
    return {
        "base_salary": round(base_salary, 2),
        "pieces_completed": pieces_completed,
        "rate_per_piece": round(rate_per_piece, 2),
        "piece_rate_earnings": round(piece_earnings, 2),
        "overtime_hours": round(overtime_hours, 1),
        "overtime_pay": round(ot_pay, 2),
        "efficiency_bonus": round(efficiency_bonus, 2),
        "attendance_allowance": round(attendance_allowance, 2),
        "gross_earnings": round(gross, 2),
        "deductions": round(deductions, 2),
        "net_payable_salary": round(net, 2),
    }
