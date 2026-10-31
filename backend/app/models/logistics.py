from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import String, Integer, Numeric, Text, DateTime, Date, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class DeliveryChallan(TimestampMixin, Base):
    __tablename__ = "delivery_challans"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    challan_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    job_number: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    party_name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    delivery_factory: Mapped[str] = mapped_column(String(255), nullable=False)
    pickup_number: Mapped[str] = mapped_column(String(100), nullable=False, default="TRUCK-01")
    delivery_date: Mapped[date] = mapped_column(Date, nullable=False)
    
    # Buyer & Spec References
    buyer_name: Mapped[str] = mapped_column(String(150), nullable=False)
    style_number: Mapped[str] = mapped_column(String(100), nullable=False)
    po_number: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # Official Statuses from Industrial Practice
    receive_status: Mapped[str] = mapped_column(String(50), nullable=False, default="NOT_RECEIVED")  # NOT_RECEIVED, RECEIVED
    delivery_status: Mapped[str] = mapped_column(String(50), nullable=False, default="ALL_DELIVERED")  # ALL_DELIVERED, HAVE_DUE
    
    # 3-Way Quantities & Packing
    total_order_qty: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    current_delivery_qty: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    previous_delivery_qty: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    balance_due_qty: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    total_packaging_qty: Mapped[int] = mapped_column(Integer, nullable=False, default=1)  # Cartons or poly bags
    
    # Financial Valuation
    total_amount_bdt: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    total_amount_usd: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    
    # Verification & Signatures
    prepared_by: Mapped[str] = mapped_column(String(150), nullable=False, default="Md. Mahmudul Hassan Emon")
    security_incharge: Mapped[str] = mapped_column(String(150), nullable=False, default="Main Gate Security Officer")
    authorized_by: Mapped[str] = mapped_column(String(150), nullable=False, default="Factory Commercial Manager")
    
    # Detailed itemized list (JSON for fast rendering)
    items_json: Mapped[str | None] = mapped_column(Text)


class GatePass(TimestampMixin, Base):
    __tablename__ = "gate_passes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    gate_pass_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    pass_date: Mapped[date] = mapped_column(Date, nullable=False)
    
    # Destination & Transport
    factory_name: Mapped[str] = mapped_column(String(200), nullable=False)
    factory_address: Mapped[str] = mapped_column(String(255), nullable=False)
    pickup_number: Mapped[str] = mapped_column(String(100), nullable=False)
    driver_name: Mapped[str] = mapped_column(String(150), nullable=False, default="Abdul Karim")
    driver_phone: Mapped[str] = mapped_column(String(50), nullable=False, default="+880 1712-345678")
    
    # Consolidated delivery challans (JSON array of challan records)
    challans_json: Mapped[str | None] = mapped_column(Text)
    total_quantity: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    total_packaging_qty: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # Security Clearance
    prepared_by: Mapped[str] = mapped_column(String(150), nullable=False, default="Commercial Officer")
    security_incharge: Mapped[str] = mapped_column(String(150), nullable=False, default="Security Sub-Inspector")
    authorized_by: Mapped[str] = mapped_column(String(150), nullable=False, default="AGM Production & Security")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="GATE_OUT")  # GATE_OUT, PENDING_CLEARANCE


class MoneyReceive(TimestampMixin, Base):
    __tablename__ = "money_receives"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    voucher_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)  # FPL-MR-25-0001
    receipt_date: Mapped[date] = mapped_column(Date, nullable=False)
    
    party_name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    group_name: Mapped[str | None] = mapped_column(String(200))
    buyer_name: Mapped[str | None] = mapped_column(String(150))
    
    total_paid_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="BDT")  # BDT or USD
    payment_method: Mapped[str] = mapped_column(String(50), nullable=False, default="AT_SIGHT_LC")  # AT_SIGHT_LC, CASH, CHEQUE, BANK_WIRE
    
    document_reference: Mapped[str | None] = mapped_column(String(255))  # e.g., Bill No. 05 / Document No. 025
    attachment_name: Mapped[str | None] = mapped_column(String(255))
    remarks: Mapped[str | None] = mapped_column(Text)
    allocated_challans_json: Mapped[str | None] = mapped_column(Text)
