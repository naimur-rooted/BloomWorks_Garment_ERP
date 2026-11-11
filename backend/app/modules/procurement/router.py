from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.inventory import StockCategory, TransactionType
from app.models.master import Material, Supplier
from app.models.procurement import (
    GoodsReceipt,
    GoodsReceiptItem,
    GoodsReceiptStatus,
    PurchaseOrder,
    PurchaseOrderItem,
    PurchaseOrderStatus,
    PurchaseRequisition,
    PurchaseRequisitionItem,
    RequisitionStatus,
)
from app.models.user import User
from app.schemas.schemas import (
    GoodsReceiptCreate,
    GoodsReceiptOut,
    GoodsReceiptItemOut,
    PRItemOut,
    PurchaseOrderCreate,
    PurchaseOrderOut,
    PurchaseOrderItemOut,
    PurchaseRequisitionCreate,
    PurchaseRequisitionOut,
)
from app.services.inventory_service import post_inventory_transaction

router = APIRouter(tags=["Procurement"])

pr_router = APIRouter(prefix="/requisitions", tags=["Purchase Requisitions"])
pr_alias_router = APIRouter(prefix="/purchase-requisitions", tags=["Purchase Requisitions"])
po_router = APIRouter(prefix="/purchase-orders", tags=["Purchase Orders"])
gr_router = APIRouter(prefix="/goods-receipts", tags=["Goods Receipts"])


def _pr_to_out(db: Session, pr: PurchaseRequisition) -> PurchaseRequisitionOut:
    out = PurchaseRequisitionOut.model_validate(pr)
    items = []
    for item in pr.items:
        item_out = PRItemOut.model_validate(item)
        material = db.query(Material).filter(Material.id == item.material_id).first()
        if material:
            item_out.material_code = material.code
            item_out.material_name = material.name
        items.append(item_out)
    out.items = items
    return out


def _po_to_out(db: Session, po: PurchaseOrder) -> PurchaseOrderOut:
    out = PurchaseOrderOut.model_validate(po)
    supplier = db.query(Supplier).filter(Supplier.id == po.supplier_id).first()
    out.supplier_name = supplier.name if supplier else None
    items = []
    for item in po.items:
        item_out = PurchaseOrderItemOut.model_validate(item)
        material = db.query(Material).filter(Material.id == item.material_id).first()
        if material:
            item_out.material_code = material.code
            item_out.material_name = material.name
        items.append(item_out)
    out.items = items
    return out


def _gr_to_out(db: Session, gr: GoodsReceipt) -> GoodsReceiptOut:
    out = GoodsReceiptOut.model_validate(gr)
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == gr.purchase_order_id).first()
    out.po_number = po.po_number if po else None
    items = []
    for item in gr.items:
        item_out = GoodsReceiptItemOut.model_validate(item)
        material = db.query(Material).filter(Material.id == item.material_id).first()
        if material:
            item_out.material_code = material.code
            item_out.material_name = material.name
        items.append(item_out)
    out.items = items
    return out


# ---------- Purchase Requisitions ----------
@pr_router.get("", response_model=list[PurchaseRequisitionOut])
def list_requisitions(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return [_pr_to_out(db, pr) for pr in db.query(PurchaseRequisition).all()]


@pr_router.post("", response_model=PurchaseRequisitionOut, status_code=201)
def create_requisition(
    payload: PurchaseRequisitionCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    existing = db.query(PurchaseRequisition).filter(PurchaseRequisition.pr_number == payload.pr_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="PR number already exists")

    pr = PurchaseRequisition(
        pr_number=payload.pr_number,
        order_id=payload.order_id,
        requested_by=payload.requested_by,
        required_date=payload.required_date,
        notes=payload.notes,
    )
    db.add(pr)
    db.flush()

    for item_data in payload.items:
        material = db.query(Material).filter(Material.id == item_data.material_id).first()
        if not material:
            raise HTTPException(status_code=400, detail=f"Material {item_data.material_id} not found")
        db.add(
            PurchaseRequisitionItem(
                requisition_id=pr.id,
                material_id=item_data.material_id,
                quantity=item_data.quantity,
                uom=item_data.uom or material.uom,
                requirement_id=item_data.requirement_id,
                notes=item_data.notes,
            )
        )

    db.commit()
    db.refresh(pr)
    return _pr_to_out(db, pr)


@pr_router.get("/{pr_id}", response_model=PurchaseRequisitionOut)
def get_requisition(pr_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    pr = db.query(PurchaseRequisition).filter(PurchaseRequisition.id == pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Requisition not found")
    return _pr_to_out(db, pr)


@pr_router.post("/{pr_id}/submit", response_model=PurchaseRequisitionOut)
def submit_requisition(pr_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    pr = db.query(PurchaseRequisition).filter(PurchaseRequisition.id == pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Requisition not found")
    pr.status = RequisitionStatus.SUBMITTED
    db.commit()
    db.refresh(pr)
    return _pr_to_out(db, pr)


@pr_router.post("/{pr_id}/approve", response_model=PurchaseRequisitionOut)
def approve_requisition(pr_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    pr = db.query(PurchaseRequisition).filter(PurchaseRequisition.id == pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Requisition not found")
    pr.status = RequisitionStatus.APPROVED
    db.commit()
    db.refresh(pr)
    return _pr_to_out(db, pr)


@pr_router.delete("/{pr_id}", status_code=204)
def delete_requisition(pr_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    pr = db.query(PurchaseRequisition).filter(PurchaseRequisition.id == pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Requisition not found")
    db.delete(pr)
    db.commit()


# Alias routes for /purchase-requisitions compatibility
pr_alias_router.add_api_route("", list_requisitions, methods=["GET"], response_model=list[PurchaseRequisitionOut])
pr_alias_router.add_api_route("", create_requisition, methods=["POST"], response_model=PurchaseRequisitionOut, status_code=201)
pr_alias_router.add_api_route("/{pr_id}", get_requisition, methods=["GET"], response_model=PurchaseRequisitionOut)
pr_alias_router.add_api_route("/{pr_id}/submit", submit_requisition, methods=["POST"], response_model=PurchaseRequisitionOut)
pr_alias_router.add_api_route("/{pr_id}/approve", approve_requisition, methods=["POST"], response_model=PurchaseRequisitionOut)
pr_alias_router.add_api_route("/{pr_id}", delete_requisition, methods=["DELETE"], status_code=204)


# ---------- Purchase Orders ----------
@po_router.get("", response_model=list[PurchaseOrderOut])
def list_purchase_orders(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return [_po_to_out(db, po) for po in db.query(PurchaseOrder).all()]


@po_router.post("", response_model=PurchaseOrderOut, status_code=201)
def create_purchase_order(
    payload: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    existing = db.query(PurchaseOrder).filter(PurchaseOrder.po_number == payload.po_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="PO number already exists")

    po = PurchaseOrder(
        po_number=payload.po_number,
        supplier_id=payload.supplier_id,
        requisition_id=payload.requisition_id,
        order_date=payload.order_date,
        expected_date=payload.expected_date,
        currency=payload.currency,
        notes=payload.notes,
    )
    db.add(po)
    db.flush()

    for item_data in payload.items:
        material = db.query(Material).filter(Material.id == item_data.material_id).first()
        if not material:
            raise HTTPException(status_code=400, detail=f"Material {item_data.material_id} not found")
        db.add(
            PurchaseOrderItem(
                purchase_order_id=po.id,
                material_id=item_data.material_id,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                uom=item_data.uom or material.uom,
                notes=item_data.notes,
            )
        )

    db.commit()
    db.refresh(po)
    return _po_to_out(db, po)


@po_router.get("/{po_id}", response_model=PurchaseOrderOut)
def get_purchase_order(po_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return _po_to_out(db, po)


@po_router.post("/{po_id}/send", response_model=PurchaseOrderOut)
def send_purchase_order(po_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    po.status = PurchaseOrderStatus.SENT
    db.commit()
    db.refresh(po)
    return _po_to_out(db, po)


@po_router.delete("/{po_id}", status_code=204)
def delete_purchase_order(po_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    db.delete(po)
    db.commit()


# ---------- Goods Receipts ----------
@gr_router.get("", response_model=list[GoodsReceiptOut])
def list_goods_receipts(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return [_gr_to_out(db, gr) for gr in db.query(GoodsReceipt).all()]


@gr_router.post("", response_model=GoodsReceiptOut, status_code=201)
def create_goods_receipt(
    payload: GoodsReceiptCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    existing = db.query(GoodsReceipt).filter(GoodsReceipt.gr_number == payload.gr_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="GR number already exists")

    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == payload.purchase_order_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")

    gr = GoodsReceipt(
        gr_number=payload.gr_number,
        purchase_order_id=payload.purchase_order_id,
        receipt_date=payload.receipt_date,
        received_by=payload.received_by,
        notes=payload.notes,
        status=GoodsReceiptStatus.RECEIVED,
    )
    db.add(gr)
    db.flush()

    for item_data in payload.items:
        po_item = db.query(PurchaseOrderItem).filter(
            PurchaseOrderItem.id == item_data.po_item_id,
            PurchaseOrderItem.purchase_order_id == payload.purchase_order_id,
        ).first()
        if not po_item:
            raise HTTPException(status_code=400, detail=f"PO item {item_data.po_item_id} not found")

        db.add(
            GoodsReceiptItem(
                goods_receipt_id=gr.id,
                po_item_id=item_data.po_item_id,
                material_id=item_data.material_id,
                received_qty=item_data.received_qty,
                accepted_qty=item_data.accepted_qty,
                rejected_qty=item_data.rejected_qty,
                uom=item_data.uom,
            )
        )

        # Update PO item received qty
        po_item.received_qty += item_data.received_qty

        # Post inventory transaction for accepted goods
        post_inventory_transaction(
            db,
            transaction_type=TransactionType.PURCHASE_RECEIPT,
            quantity=item_data.accepted_qty,
            category=StockCategory.RAW_MATERIAL,
            material_id=item_data.material_id,
            reference_type="GoodsReceipt",
            reference_id=gr.id,
            remarks=f"GR {payload.gr_number}",
        )

    # Update PO status
    all_received = all(item.received_qty >= item.quantity for item in po.items)
    po.status = PurchaseOrderStatus.RECEIVED if all_received else PurchaseOrderStatus.PARTIALLY_RECEIVED

    db.commit()
    db.refresh(gr)
    return _gr_to_out(db, gr)


@gr_router.get("/{gr_id}", response_model=GoodsReceiptOut)
def get_goods_receipt(gr_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    gr = db.query(GoodsReceipt).filter(GoodsReceipt.id == gr_id).first()
    if not gr:
        raise HTTPException(status_code=404, detail="Goods receipt not found")
    return _gr_to_out(db, gr)