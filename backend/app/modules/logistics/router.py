from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.logistics import DeliveryChallan, GatePass, MoneyReceive
from app.models.user import User
from app.schemas.schemas import (
    DeliveryChallanCreate,
    DeliveryChallanOut,
    GatePassCreate,
    GatePassOut,
    MoneyReceiveCreate,
    MoneyReceiveOut,
)

router = APIRouter(prefix="/logistics", tags=["Logistics & Commercial"])


# =========================================================================
# 1. DELIVERY CHALLANS
# =========================================================================

@router.get("/challans", response_model=List[DeliveryChallanOut])
def list_delivery_challans(
    party_name: Optional[str] = Query(None),
    receive_status: Optional[str] = Query(None),
    delivery_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(DeliveryChallan)
    if party_name:
        query = query.filter(DeliveryChallan.party_name.ilike(f"%{party_name}%"))
    if receive_status:
        query = query.filter(DeliveryChallan.receive_status == receive_status)
    if delivery_status:
        query = query.filter(DeliveryChallan.delivery_status == delivery_status)
    if search:
        search_filter = or_(
            DeliveryChallan.challan_number.ilike(f"%{search}%"),
            DeliveryChallan.job_number.ilike(f"%{search}%"),
            DeliveryChallan.party_name.ilike(f"%{search}%"),
            DeliveryChallan.buyer_name.ilike(f"%{search}%"),
            DeliveryChallan.style_number.ilike(f"%{search}%"),
        )
        query = query.filter(search_filter)

    return query.order_by(DeliveryChallan.id.desc()).all()


@router.post("/challans", response_model=DeliveryChallanOut, status_code=201)
def create_delivery_challan(
    payload: DeliveryChallanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check duplicate challan
    existing = db.query(DeliveryChallan).filter(
        DeliveryChallan.challan_number == payload.challan_number
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Challan number already exists")

    # 3-Way balance arithmetic
    tot_order = Decimal(str(payload.total_order_qty or 0))
    prev_del = Decimal(str(payload.previous_delivery_qty or 0))
    curr_del = Decimal(str(payload.current_delivery_qty or 0))
    balance_due = tot_order - (prev_del + curr_del)
    if balance_due < Decimal("0.00"):
        balance_due = Decimal("0.00")

    # Delivery status classification
    del_status = "ALL_DELIVERED" if balance_due <= Decimal("0.00") else "HAVE_DUE"

    challan_dict = payload.model_dump()
    challan_dict["balance_due_qty"] = balance_due
    challan_dict["delivery_status"] = del_status
    if not challan_dict.get("prepared_by"):
        challan_dict["prepared_by"] = current_user.full_name or "Commercial Executive"

    challan = DeliveryChallan(**challan_dict)
    db.add(challan)
    db.commit()
    db.refresh(challan)
    return challan


@router.get("/challans/{challan_id}", response_model=DeliveryChallanOut)
def get_delivery_challan(
    challan_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    challan = db.query(DeliveryChallan).filter(DeliveryChallan.id == challan_id).first()
    if not challan:
        raise HTTPException(status_code=404, detail="Challan not found")
    return challan


@router.patch("/challans/{challan_id}/toggle-receive", response_model=DeliveryChallanOut)
def toggle_challan_receive(
    challan_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    challan = db.query(DeliveryChallan).filter(DeliveryChallan.id == challan_id).first()
    if not challan:
        raise HTTPException(status_code=404, detail="Challan not found")
    
    if challan.receive_status == "RECEIVED":
        challan.receive_status = "NOT_RECEIVED"
    else:
        challan.receive_status = "RECEIVED"
        
    db.commit()
    db.refresh(challan)
    return challan


# =========================================================================
# 2. SECURITY GATE PASSES
# =========================================================================

@router.get("/gate-passes", response_model=List[GatePassOut])
def list_gate_passes(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(GatePass).order_by(GatePass.id.desc()).all()


@router.post("/gate-passes", response_model=GatePassOut, status_code=201)
def create_gate_pass(
    payload: GatePassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(GatePass).filter(
        GatePass.gate_pass_number == payload.gate_pass_number
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Gate pass number already exists")

    gp_dict = payload.model_dump()
    if not gp_dict.get("prepared_by"):
        gp_dict["prepared_by"] = current_user.full_name or "Commercial Officer"

    gate_pass = GatePass(**gp_dict)
    db.add(gate_pass)
    db.commit()
    db.refresh(gate_pass)
    return gate_pass


@router.get("/gate-passes/{gate_pass_id}", response_model=GatePassOut)
def get_gate_pass(
    gate_pass_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    gp = db.query(GatePass).filter(GatePass.id == gate_pass_id).first()
    if not gp:
        raise HTTPException(status_code=404, detail="Gate pass not found")
    return gp


# =========================================================================
# 3. COMMERCIAL MONEY RECEIVE & PARTY LEDGER
# =========================================================================

@router.get("/money-receives", response_model=List[MoneyReceiveOut])
def list_money_receives(
    party_name: Optional[str] = Query(None),
    payment_method: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(MoneyReceive)
    if party_name:
        query = query.filter(MoneyReceive.party_name.ilike(f"%{party_name}%"))
    if payment_method:
        query = query.filter(MoneyReceive.payment_method == payment_method)
    return query.order_by(MoneyReceive.receipt_date.desc(), MoneyReceive.id.desc()).all()


@router.post("/money-receives", response_model=MoneyReceiveOut, status_code=201)
def create_money_receive(
    payload: MoneyReceiveCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    existing = db.query(MoneyReceive).filter(
        MoneyReceive.voucher_number == payload.voucher_number
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Voucher number already exists")

    mr = MoneyReceive(**payload.model_dump())
    db.add(mr)
    db.commit()
    db.refresh(mr)
    return mr


@router.get("/parties")
def get_parties_summary(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    Returns unique parties, their total delivery billing amount, money received, and balance due.
    """
    challans = db.query(DeliveryChallan).all()
    money_receives = db.query(MoneyReceive).all()

    parties_map = {}

    for c in challans:
        p_name = c.party_name
        if p_name not in parties_map:
            parties_map[p_name] = {
                "party_name": p_name,
                "delivery_factory": c.delivery_factory,
                "buyer_name": c.buyer_name,
                "total_challans": 0,
                "total_order_qty": 0.0,
                "total_delivered_qty": 0.0,
                "total_billed_bdt": 0.0,
                "total_received_bdt": 0.0,
                "balance_due_bdt": 0.0,
                "pending_receipt_challans": 0,
            }
        
        parties_map[p_name]["total_challans"] += 1
        parties_map[p_name]["total_order_qty"] += float(c.total_order_qty or 0)
        parties_map[p_name]["total_delivered_qty"] += float(c.current_delivery_qty or 0)
        parties_map[p_name]["total_billed_bdt"] += float(c.total_amount_bdt or 0)
        if c.receive_status != "RECEIVED":
            parties_map[p_name]["pending_receipt_challans"] += 1

    for mr in money_receives:
        p_name = mr.party_name
        if p_name in parties_map:
            parties_map[p_name]["total_received_bdt"] += float(mr.total_paid_amount or 0)
        else:
            parties_map[p_name] = {
                "party_name": p_name,
                "delivery_factory": p_name,
                "buyer_name": mr.buyer_name or "-",
                "total_challans": 0,
                "total_order_qty": 0.0,
                "total_delivered_qty": 0.0,
                "total_billed_bdt": 0.0,
                "total_received_bdt": float(mr.total_paid_amount or 0),
                "balance_due_bdt": 0.0,
                "pending_receipt_challans": 0,
            }

    for p in parties_map.values():
        p["balance_due_bdt"] = round(p["total_billed_bdt"] - p["total_received_bdt"], 2)

    return list(parties_map.values())


@router.get("/party-ledger/{party_name}")
def get_party_ledger(
    party_name: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    challans = (
        db.query(DeliveryChallan)
        .filter(DeliveryChallan.party_name.ilike(f"%{party_name}%"))
        .order_by(DeliveryChallan.delivery_date.asc(), DeliveryChallan.id.asc())
        .all()
    )
    receives = (
        db.query(MoneyReceive)
        .filter(MoneyReceive.party_name.ilike(f"%{party_name}%"))
        .order_by(MoneyReceive.receipt_date.asc(), MoneyReceive.id.asc())
        .all()
    )

    tot_billed = sum(float(c.total_amount_bdt or 0) for c in challans)
    tot_received = sum(float(r.total_paid_amount or 0) for r in receives)
    net_balance = round(tot_billed - tot_received, 2)

    # Build chronological running statement
    timeline = []
    running_balance = 0.0

    # Challan billings (Debit/Increase balance)
    for c in challans:
        amt = float(c.total_amount_bdt or 0)
        running_balance += amt
        timeline.append({
            "date": c.delivery_date.isoformat() if c.delivery_date else "",
            "type": "CHALLAN",
            "doc_no": c.challan_number,
            "job_no": c.job_number,
            "buyer": c.buyer_name,
            "details": f"Delivery of {c.style_number} ({c.current_delivery_qty} pcs)",
            "debit_billed": amt,
            "credit_received": 0.0,
            "running_balance": round(running_balance, 2),
            "status": c.receive_status,
        })

    # Money receive vouchers (Credit/Decrease balance)
    for r in receives:
        amt = float(r.total_paid_amount or 0)
        running_balance -= amt
        timeline.append({
            "date": r.receipt_date.isoformat() if r.receipt_date else "",
            "type": "MONEY_RECEIVE",
            "doc_no": r.voucher_number,
            "job_no": r.document_reference or "-",
            "buyer": r.buyer_name or "-",
            "details": f"Payment via {r.payment_method} - {r.remarks or 'Paid'}",
            "debit_billed": 0.0,
            "credit_received": amt,
            "running_balance": round(running_balance, 2),
            "status": "SETTLED",
        })

    # Sort timeline by date
    timeline.sort(key=lambda x: x["date"])

    return {
        "party_name": party_name,
        "total_billed_bdt": round(tot_billed, 2),
        "total_received_bdt": round(tot_received, 2),
        "net_outstanding_balance_bdt": net_balance,
        "challans_count": len(challans),
        "vouchers_count": len(receives),
        "timeline": timeline,
    }
