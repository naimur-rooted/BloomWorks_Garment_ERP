import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.tracking import Bundle, BundleStage, BundleStatus
from app.modules.tracking.mongo_db import get_mongo_database

STAGE_ORDER = [
    BundleStage.CUTTING.value,
    BundleStage.WASHING.value,
    BundleStage.SEWING_IN.value,
    BundleStage.SEWING_OUT_QC.value,
    BundleStage.FINISHING.value,
    BundleStage.PACKED.value,
]

STAGE_NAMES = {
    BundleStage.CUTTING.value: "Cutting Room",
    BundleStage.WASHING.value: "Laundry / Wash",
    BundleStage.SEWING_IN.value: "Sewing Line In",
    BundleStage.SEWING_OUT_QC.value: "Sewing Output (QC)",
    BundleStage.FINISHING.value: "Finishing & Ironing",
    BundleStage.PACKED.value: "Carton Packing",
}


def serialize_bundle(bundle: Bundle) -> Dict[str, Any]:
    history = []
    if bundle.history_json:
        try:
            history = json.loads(bundle.history_json)
        except Exception:
            history = []

    return {
        "id": bundle.id,
        "bundle_code": bundle.bundle_code,
        "order_number": bundle.order_number,
        "style_code": bundle.style_code,
        "color_name": bundle.color_name,
        "size_code": bundle.size_code,
        "cut_number": bundle.cut_number,
        "bundle_seq": bundle.bundle_seq,
        "total_bundles": bundle.total_bundles,
        "quantity": bundle.quantity,
        "ply_start": bundle.ply_start,
        "ply_end": bundle.ply_end,
        "current_stage": bundle.current_stage,
        "stage_label": STAGE_NAMES.get(bundle.current_stage, bundle.current_stage),
        "status": bundle.status,
        "defect_count": bundle.defect_count,
        "history": history,
        "created_at": bundle.created_at.isoformat() if bundle.created_at else None,
        "updated_at": bundle.updated_at.isoformat() if bundle.updated_at else None,
    }


def seed_demo_bundles_if_empty(db: Session):
    demo_data = [
        # Cut 101 - Navy Polo - Size M (4 bundles x 25 pcs = 100 pcs)
        ("BND-PO8821-C101-B01", "PO-8821", "POLO-CLASSIC-01", "Navy Blue", "M", "CUT-101", 1, 4, 25, 1, 25, BundleStage.PACKED.value, BundleStatus.COMPLETED.value, 0),
        ("BND-PO8821-C101-B02", "PO-8821", "POLO-CLASSIC-01", "Navy Blue", "M", "CUT-101", 2, 4, 25, 26, 50, BundleStage.FINISHING.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8821-C101-B03", "PO-8821", "POLO-CLASSIC-01", "Navy Blue", "M", "CUT-101", 3, 4, 25, 51, 75, BundleStage.SEWING_OUT_QC.value, BundleStatus.IN_PROGRESS.value, 1),
        ("BND-PO8821-C101-B04", "PO-8821", "POLO-CLASSIC-01", "Navy Blue", "M", "CUT-101", 4, 4, 25, 76, 100, BundleStage.SEWING_IN.value, BundleStatus.IN_PROGRESS.value, 0),

        # Cut 101 - Navy Polo - Size L (4 bundles x 25 pcs = 100 pcs)
        ("BND-PO8821-C101-B05", "PO-8821", "POLO-CLASSIC-01", "Navy Blue", "L", "CUT-101", 1, 4, 25, 1, 25, BundleStage.WASHING.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8821-C101-B06", "PO-8821", "POLO-CLASSIC-01", "Navy Blue", "L", "CUT-101", 2, 4, 25, 26, 50, BundleStage.WASHING.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8821-C101-B07", "PO-8821", "POLO-CLASSIC-01", "Navy Blue", "L", "CUT-101", 3, 4, 25, 51, 75, BundleStage.CUTTING.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8821-C101-B08", "PO-8821", "POLO-CLASSIC-01", "Navy Blue", "L", "CUT-101", 4, 4, 25, 76, 100, BundleStage.CUTTING.value, BundleStatus.IN_PROGRESS.value, 0),

        # Cut 102 - White Polo - Size M (4 bundles x 20 pcs = 80 pcs)
        ("BND-PO8822-C102-B01", "PO-8822", "DENIM-SLIM-02", "Vintage Indigo", "32", "CUT-102", 1, 4, 20, 1, 20, BundleStage.PACKED.value, BundleStatus.COMPLETED.value, 0),
        ("BND-PO8822-C102-B02", "PO-8822", "DENIM-SLIM-02", "Vintage Indigo", "32", "CUT-102", 2, 4, 20, 21, 40, BundleStage.FINISHING.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8822-C102-B03", "PO-8822", "DENIM-SLIM-02", "Vintage Indigo", "32", "CUT-102", 3, 4, 20, 41, 60, BundleStage.SEWING_OUT_QC.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8822-C102-B04", "PO-8822", "DENIM-SLIM-02", "Vintage Indigo", "32", "CUT-102", 4, 4, 20, 61, 80, BundleStage.SEWING_IN.value, BundleStatus.IN_PROGRESS.value, 0),

        # Cut 102 - Denim - Size 34 (4 bundles x 20 pcs = 80 pcs)
        ("BND-PO8822-C102-B05", "PO-8822", "DENIM-SLIM-02", "Vintage Indigo", "34", "CUT-102", 1, 4, 20, 1, 20, BundleStage.WASHING.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8822-C102-B06", "PO-8822", "DENIM-SLIM-02", "Vintage Indigo", "34", "CUT-102", 2, 4, 20, 21, 40, BundleStage.WASHING.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8822-C102-B07", "PO-8822", "DENIM-SLIM-02", "Vintage Indigo", "34", "CUT-102", 3, 4, 20, 41, 60, BundleStage.CUTTING.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8822-C102-B08", "PO-8822", "DENIM-SLIM-02", "Vintage Indigo", "34", "CUT-102", 4, 4, 20, 61, 80, BundleStage.CUTTING.value, BundleStatus.IN_PROGRESS.value, 0),

        # Cut 103 - Heavyweight Hoodie - Royal Navy (6 bundles x 20 pcs = 120 pcs)
        ("BND-PO8823-C103-B01", "PO-8823", "HOODIE-TERRY-03", "Royal Navy", "M", "CUT-103", 1, 6, 20, 1, 20, BundleStage.PACKED.value, BundleStatus.COMPLETED.value, 0),
        ("BND-PO8823-C103-B02", "PO-8823", "HOODIE-TERRY-03", "Royal Navy", "M", "CUT-103", 2, 6, 20, 21, 40, BundleStage.FINISHING.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8823-C103-B03", "PO-8823", "HOODIE-TERRY-03", "Royal Navy", "M", "CUT-103", 3, 6, 20, 41, 60, BundleStage.SEWING_OUT_QC.value, BundleStatus.IN_PROGRESS.value, 1),
        ("BND-PO8823-C103-B04", "PO-8823", "HOODIE-TERRY-03", "Royal Navy", "L", "CUT-103", 4, 6, 20, 61, 80, BundleStage.SEWING_IN.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8823-C103-B05", "PO-8823", "HOODIE-TERRY-03", "Royal Navy", "L", "CUT-103", 5, 6, 20, 81, 100, BundleStage.WASHING.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8823-C103-B06", "PO-8823", "HOODIE-TERRY-03", "Royal Navy", "XL", "CUT-103", 6, 6, 20, 101, 120, BundleStage.CUTTING.value, BundleStatus.IN_PROGRESS.value, 0),

        # Cut 104 - Linen Shirt - Pure White (6 bundles x 15 pcs = 90 pcs)
        ("BND-PO8824-C104-B01", "PO-8824", "SHIRT-LINEN-04", "Optic White", "M", "CUT-104", 1, 6, 15, 1, 15, BundleStage.PACKED.value, BundleStatus.COMPLETED.value, 0),
        ("BND-PO8824-C104-B02", "PO-8824", "SHIRT-LINEN-04", "Optic White", "M", "CUT-104", 2, 6, 15, 16, 30, BundleStage.FINISHING.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8824-C104-B03", "PO-8824", "SHIRT-LINEN-04", "Optic White", "L", "CUT-104", 3, 6, 15, 31, 45, BundleStage.SEWING_OUT_QC.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8824-C104-B04", "PO-8824", "SHIRT-LINEN-04", "Optic White", "L", "CUT-104", 4, 6, 15, 46, 60, BundleStage.SEWING_IN.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8824-C104-B05", "PO-8824", "SHIRT-LINEN-04", "Optic White", "XL", "CUT-104", 5, 6, 15, 61, 75, BundleStage.CUTTING.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8824-C104-B06", "PO-8824", "SHIRT-LINEN-04", "Optic White", "XL", "CUT-104", 6, 6, 15, 76, 90, BundleStage.CUTTING.value, BundleStatus.IN_PROGRESS.value, 0),

        # Cut 105 - Chino Shorts - Sand Dune Khaki (6 bundles x 20 pcs = 120 pcs)
        ("BND-PO8825-C105-B01", "PO-8825", "CHINO-SHORT-05", "Sand Dune Khaki", "32", "CUT-105", 1, 6, 20, 1, 20, BundleStage.PACKED.value, BundleStatus.COMPLETED.value, 0),
        ("BND-PO8825-C105-B02", "PO-8825", "CHINO-SHORT-05", "Sand Dune Khaki", "32", "CUT-105", 2, 6, 20, 21, 40, BundleStage.FINISHING.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8825-C105-B03", "PO-8825", "CHINO-SHORT-05", "Sand Dune Khaki", "34", "CUT-105", 3, 6, 20, 41, 60, BundleStage.SEWING_OUT_QC.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8825-C105-B04", "PO-8825", "CHINO-SHORT-05", "Sand Dune Khaki", "34", "CUT-105", 4, 6, 20, 61, 80, BundleStage.SEWING_IN.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8825-C105-B05", "PO-8825", "CHINO-SHORT-05", "Sand Dune Khaki", "36", "CUT-105", 5, 6, 20, 81, 100, BundleStage.CUTTING.value, BundleStatus.IN_PROGRESS.value, 0),
        ("BND-PO8825-C105-B06", "PO-8825", "CHINO-SHORT-05", "Sand Dune Khaki", "36", "CUT-105", 6, 6, 20, 101, 120, BundleStage.CUTTING.value, BundleStatus.IN_PROGRESS.value, 0),
    ]

    now_iso = datetime.utcnow().isoformat()
    for code, order, style, color, size, cut, seq, total, qty, p_start, p_end, stage, status, def_cnt in demo_data:
        existing = db.query(Bundle).filter(Bundle.bundle_code == code).first()
        if not existing:
            history = [
                {"stage": BundleStage.CUTTING.value, "station": "TABLE-01", "operator": "Cutting Master Kamal", "timestamp": now_iso, "notes": "Plies spread and cut"}
            ]
            if stage != BundleStage.CUTTING.value:
                history.append({"stage": stage, "station": f"STATION-{stage}", "operator": "Line Supervisor", "timestamp": now_iso, "notes": "Transferred"})

            b = Bundle(
                bundle_code=code,
                order_number=order,
                style_code=style,
                color_name=color,
                size_code=size,
                cut_number=cut,
                bundle_seq=seq,
                total_bundles=total,
                quantity=qty,
                ply_start=p_start,
                ply_end=p_end,
                current_stage=stage,
                status=status,
                defect_count=def_cnt,
                history_json=json.dumps(history),
            )
            db.add(b)

    db.commit()


def get_wip_pipeline_summary(db: Session) -> Dict[str, Any]:
    seed_demo_bundles_if_empty(db)
    bundles = db.query(Bundle).all()

    stage_counts = {s: 0 for s in STAGE_ORDER}
    stage_pieces = {s: 0 for s in STAGE_ORDER}
    total_pieces = 0
    total_bundles = len(bundles)

    for b in bundles:
        stage = b.current_stage
        if stage in stage_counts:
            stage_counts[stage] += 1
            stage_pieces[stage] += b.quantity
        total_pieces += b.quantity

    sewing_completed = stage_pieces.get(BundleStage.SEWING_OUT_QC.value, 0) + stage_pieces.get(BundleStage.FINISHING.value, 0) + stage_pieces.get(BundleStage.PACKED.value, 0)
    sewing_target = 300
    efficiency_pct = min(100, round((sewing_completed / max(1, sewing_target)) * 100, 1))

    return {
        "total_bundles": total_bundles,
        "total_pieces": total_pieces,
        "stages": [
            {
                "key": s,
                "label": STAGE_NAMES.get(s, s),
                "bundle_count": stage_counts[s],
                "piece_count": stage_pieces[s],
            }
            for s in STAGE_ORDER
        ],
        "metrics": {
            "sewing_efficiency_pct": efficiency_pct,
            "target_pieces": sewing_target,
            "completed_pieces": sewing_completed,
            "packed_pieces": stage_pieces.get(BundleStage.PACKED.value, 0),
            "cutting_wip": stage_pieces.get(BundleStage.CUTTING.value, 0),
            "sewing_wip": stage_pieces.get(BundleStage.SEWING_IN.value, 0),
        }
    }


def list_bundles(db: Session, stage: Optional[str] = None, order_number: Optional[str] = None) -> List[Dict[str, Any]]:
    seed_demo_bundles_if_empty(db)
    query = db.query(Bundle)
    if stage and stage != "ALL":
        query = query.filter(Bundle.current_stage == stage)
    if order_number and order_number != "ALL":
        query = query.filter(Bundle.order_number == order_number)

    bundles = query.order_by(Bundle.id.asc()).all()
    return [serialize_bundle(b) for b in bundles]


def process_barcode_scan(
    db: Session,
    barcode: str,
    target_stage: Optional[str] = None,
    station_id: Optional[str] = None,
    operator_name: Optional[str] = None,
    defect_count: int = 0,
    notes: Optional[str] = None
) -> Dict[str, Any]:
    seed_demo_bundles_if_empty(db)
    clean_code = barcode.strip()

    bundle = db.query(Bundle).filter(Bundle.bundle_code == clean_code).first()
    if not bundle:
        return {
            "success": False,
            "message": f"Barcode '{clean_code}' not found in active production records.",
            "code": clean_code
        }

    current_idx = STAGE_ORDER.index(bundle.current_stage) if bundle.current_stage in STAGE_ORDER else 0

    # Determine next stage if not specified
    if not target_stage or target_stage == "AUTO_NEXT":
        if current_idx < len(STAGE_ORDER) - 1:
            next_stage = STAGE_ORDER[current_idx + 1]
        else:
            return {
                "success": False,
                "message": f"Bundle {clean_code} is already at final stage ({STAGE_NAMES.get(bundle.current_stage)}).",
                "bundle": serialize_bundle(bundle)
            }
    else:
        next_stage = target_stage

    # Update history
    history = []
    if bundle.history_json:
        try:
            history = json.loads(bundle.history_json)
        except Exception:
            history = []

    scan_event = {
        "stage": next_stage,
        "stage_label": STAGE_NAMES.get(next_stage, next_stage),
        "station": station_id or "STATION-DEFAULT",
        "operator": operator_name or "Floor Operator",
        "timestamp": datetime.utcnow().isoformat(),
        "notes": notes or ("Defects logged: " + str(defect_count) if defect_count > 0 else "Normal transition")
    }
    history.append(scan_event)

    bundle.current_stage = next_stage
    bundle.history_json = json.dumps(history)
    bundle.defect_count += defect_count
    if next_stage == BundleStage.PACKED.value:
        bundle.status = BundleStatus.COMPLETED.value

    db.commit()
    db.refresh(bundle)

    # Sync to MongoDB Atlas if connected
    mongo_db = get_mongo_database()
    if mongo_db is not None:
        try:
            mongo_db.bundles.update_one(
                {"bundle_code": bundle.bundle_code},
                {"$set": serialize_bundle(bundle)},
                upsert=True
            )
        except Exception as e:
            print(f"[MongoDB Sync Notice] {e}")

    return {
        "success": True,
        "message": f"Bundle {bundle.bundle_code} scanned successfully into {STAGE_NAMES.get(next_stage, next_stage)} (+{bundle.quantity} pcs)",
        "bundle": serialize_bundle(bundle),
        "pieces_moved": bundle.quantity,
        "new_stage": next_stage
    }


def generate_new_bundles(
    db: Session,
    order_number: str,
    style_code: str,
    color_name: str,
    size_code: str,
    cut_number: str,
    total_quantity: int,
    bundle_size: int = 20
) -> List[Dict[str, Any]]:
    import math
    num_bundles = math.ceil(total_quantity / bundle_size)
    created = []
    remaining = total_quantity
    ply_counter = 1

    for seq in range(1, num_bundles + 1):
        qty = min(remaining, bundle_size)
        remaining -= qty
        ply_start = ply_counter
        ply_end = ply_counter + qty - 1
        ply_counter += qty

        code = f"BND-{order_number.replace(' ', '')}-{cut_number.replace(' ', '')}-B{seq:02d}-{size_code}"
        
        # Check if already exists
        existing = db.query(Bundle).filter(Bundle.bundle_code == code).first()
        if existing:
            created.append(serialize_bundle(existing))
            continue

        history = [{
            "stage": BundleStage.CUTTING.value,
            "station": "CUTTING-TABLE-01",
            "operator": "Cutting Master",
            "timestamp": datetime.utcnow().isoformat(),
            "notes": "Generated from Cut Order Plan"
        }]

        b = Bundle(
            bundle_code=code,
            order_number=order_number,
            style_code=style_code,
            color_name=color_name,
            size_code=size_code,
            cut_number=cut_number,
            bundle_seq=seq,
            total_bundles=num_bundles,
            quantity=qty,
            ply_start=ply_start,
            ply_end=ply_end,
            current_stage=BundleStage.CUTTING.value,
            status=BundleStatus.IN_PROGRESS.value,
            defect_count=0,
            history_json=json.dumps(history)
        )
        db.add(b)
        db.flush()
        created.append(serialize_bundle(b))

    db.commit()
    return created


def reset_demo_pipeline(db: Session):
    db.query(Bundle).delete()
    db.commit()
    seed_demo_bundles_if_empty(db)
    return {"message": "Demo bundles reset to default state"}
