from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.bom import GarmentBom
from app.models.inventory import InventoryTransaction, StockBalance, StockCategory
from app.models.master import Buyer, Material, Style, Supplier
from app.models.order import BuyerOrder, OrderStatus
from app.models.procurement import PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus
from app.models.production import WorkOrder, WorkOrderStatus
from app.models.quality import QualityInspection, QCStatus
from app.models.shipment import Shipment, ShipmentStatus
from app.models.tna import TNAMilestone, TNAStatus
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/dashboard")
@router.get("/summary")
def dashboard(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    total_orders = db.query(BuyerOrder).count()
    open_orders = db.query(BuyerOrder).filter(BuyerOrder.status.in_([OrderStatus.CONFIRMED, OrderStatus.IN_PRODUCTION])).count()
    total_styles = db.query(Style).count()
    total_buyers = db.query(Buyer).count()
    total_suppliers = db.query(Supplier).count()
    total_materials = db.query(Material).count()

    production_orders = db.query(WorkOrder).filter(WorkOrder.status == WorkOrderStatus.IN_PROGRESS).count()
    completed_orders = db.query(BuyerOrder).filter(BuyerOrder.status == OrderStatus.SHIPPED).count()

    total_po_qty = float(db.query(func.coalesce(func.sum(PurchaseOrderItem.quantity), 0)).scalar() or 0)
    total_received_qty = float(db.query(func.coalesce(func.sum(PurchaseOrderItem.received_qty), 0)).scalar() or 0)

    pending_shipments = db.query(Shipment).filter(Shipment.status == ShipmentStatus.PLANNED).count()
    overdue_milestones = db.query(TNAMilestone).filter(TNAMilestone.status == TNAStatus.OVERDUE).count()

    raw_material_balance = float(db.query(func.coalesce(func.sum(StockBalance.quantity), 0)).filter(
        StockBalance.category == StockCategory.RAW_MATERIAL
    ).scalar() or 0)
    wip_balance = float(db.query(func.coalesce(func.sum(StockBalance.quantity), 0)).filter(
        StockBalance.category == StockCategory.WIP
    ).scalar() or 0)
    finished_goods_balance = float(db.query(func.coalesce(func.sum(StockBalance.quantity), 0)).filter(
        StockBalance.category == StockCategory.FINISHED_GOODS
    ).scalar() or 0)

    orders_by_status = (
        db.query(BuyerOrder.status, func.count(BuyerOrder.id))
        .group_by(BuyerOrder.status)
        .all()
    )
    production_by_status = (
        db.query(WorkOrder.status, func.count(WorkOrder.id))
        .group_by(WorkOrder.status)
        .all()
    )

    recent_orders = db.query(BuyerOrder).order_by(BuyerOrder.created_at.desc()).limit(5).all()

    return {
        "total_orders": total_orders,
        "open_orders": open_orders,
        "total_styles": total_styles,
        "total_buyers": total_buyers,
        "total_suppliers": total_suppliers,
        "total_materials": total_materials,
        "production_orders": production_orders,
        "completed_orders": completed_orders,
        "pending_shipments": pending_shipments,
        "overdue_milestones": overdue_milestones,
        "raw_material_balance": raw_material_balance,
        "wip_balance": wip_balance,
        "finished_goods_balance": finished_goods_balance,
        "total_po_qty": total_po_qty,
        "total_received_qty": total_received_qty,
        "orders_by_status": {k.value: v for k, v in orders_by_status},
        "work_orders_by_status": {k.value: v for k, v in production_by_status},
        "recent_orders": [
            {
                "id": o.id,
                "po_number": o.po_number,
                "status": o.status.value,
                "delivery_date": str(o.delivery_date),
                "total_quantity": sum(i.quantity for i in o.items),
            }
            for o in recent_orders
        ],
    }


@router.get("/sales")
def sales_report(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    orders = db.query(BuyerOrder).all()
    total_value = sum(
        sum(i.quantity * i.unit_price for i in o.items)
        for o in orders
    )
    return {
        "total_orders": len(orders),
        "total_order_value": str(total_value),
        "orders": [
            {
                "id": o.id,
                "po_number": o.po_number,
                "status": o.status.value,
                "order_date": str(o.order_date),
                "delivery_date": str(o.delivery_date),
            }
            for o in orders
        ],
    }


@router.get("/procurement")
def procurement_report(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    pos = db.query(PurchaseOrder).all()
    return {
        "total_pos": len(pos),
        "status_breakdown": {
            status: db.query(PurchaseOrder).filter(PurchaseOrder.status == status).count()
            for status in PurchaseOrderStatus
        },
        "purchase_orders": [
            {
                "id": po.id,
                "po_number": po.po_number,
                "status": po.status,
                "order_date": str(po.order_date),
                "total_qty": sum(i.quantity for i in po.items),
                "received_qty": sum(i.received_qty for i in po.items),
            }
            for po in pos
        ],
    }


@router.get("/quality")
def quality_report(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    inspections = db.query(QualityInspection).all()
    total_inspected = sum(q.inspected_qty for q in inspections)
    total_passed = sum(q.passed_qty for q in inspections)
    total_rejected = sum(q.rejected_qty for q in inspections)
    return {
        "total_inspections": len(inspections),
        "total_inspected_qty": total_inspected,
        "total_passed_qty": total_passed,
        "total_rejected_qty": total_rejected,
        "pass_rate": round((total_passed / total_inspected * 100), 2) if total_inspected else 0,
        "status_breakdown": {
            status: db.query(QualityInspection).filter(QualityInspection.status == status).count()
            for status in QCStatus
        },
    }