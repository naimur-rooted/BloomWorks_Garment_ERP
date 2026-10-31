from datetime import date
from decimal import Decimal
from sqlalchemy import Boolean, String, Text, Date, Numeric, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class Buyer(TimestampMixin, Base):
    __tablename__ = "buyers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    contact_person: Mapped[str | None] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    address: Mapped[str | None] = mapped_column(String(500))
    country: Mapped[str | None] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    orders = relationship("BuyerOrder", back_populates="buyer", cascade="all, delete-orphan")


class Supplier(TimestampMixin, Base):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    contact_person: Mapped[str | None] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    address: Mapped[str | None] = mapped_column(String(500))
    payment_terms: Mapped[str | None] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class Color(TimestampMixin, Base):
    __tablename__ = "colors"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    code: Mapped[str | None] = mapped_column(String(50))
    hex_code: Mapped[str | None] = mapped_column(String(7))


class Size(TimestampMixin, Base):
    __tablename__ = "sizes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    code: Mapped[str | None] = mapped_column(String(20))
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class Material(TimestampMixin, Base):
    __tablename__ = "materials"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, default="Fabric")  # Fabric, Thread, Button, Zipper, Label, Accessory, Packaging
    uom: Mapped[str] = mapped_column(String(20), nullable=False)  # kg, meter, pcs, dozen, roll, cone
    unit_cost: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), default=Decimal("0.00"))
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="BDT")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class Style(TimestampMixin, Base):
    __tablename__ = "styles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    style_no: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(500))
    buyer_id: Mapped[int | None] = mapped_column(ForeignKey("buyers.id"))
    category: Mapped[str | None] = mapped_column(String(100))
    image_url: Mapped[str | None] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # 1. Classification & Garment Hierarchy
    style_type: Mapped[str] = mapped_column(String(50), nullable=False, default="Bulk")  # Bulk, Sample, Proto
    brand: Mapped[str | None] = mapped_column(String(100))  # e.g., Divided, Zara Man, Basic
    season: Mapped[str | None] = mapped_column(String(50), default="SS26")  # SS26, AW26, Monsoon
    sub_category: Mapped[str | None] = mapped_column(String(100))  # Cargo Pants, Pique Polo
    gender: Mapped[str] = mapped_column(String(50), nullable=False, default="Men")  # Men, Women, Unisex, Kids
    source_allocation: Mapped[str] = mapped_column(String(50), nullable=False, default="Inhouse")  # Inhouse, Subcontract
    
    # 2. Industrial Engineering (IE) Work Value
    sam_minutes: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False, default=Decimal("15.00"))
    target_efficiency_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=Decimal("65.00"))
    
    # 3. Critical Milestones
    creation_date: Mapped[date | None] = mapped_column(Date)
    ocd_date: Mapped[date | None] = mapped_column(Date)  # Order Confirm Date
    pcd_date: Mapped[date | None] = mapped_column(Date)  # Planned Cut Date
    ex_factory_date: Mapped[date | None] = mapped_column(Date)
    
    # 4. Merchandising Ownership
    pd_merchant_name: Mapped[str] = mapped_column(String(150), nullable=False, default="Sanat Kumar")
    prod_merchant_name: Mapped[str] = mapped_column(String(150), nullable=False, default="Sheela Singh")
    
    # 5. Lifecycle & Risk Tracking (The 9-Stage Pipeline)
    lifecycle_stage: Mapped[str] = mapped_column(String(50), nullable=False, default="ON_ORDER")  
    # NEW_STYLE, DESIGN_INNOVATION, PRODUCT_DEVELOPMENT, PROJECTION, ON_ORDER, KEY_STYLE, PENDING_PO, UN_SHIPPED
    risk_priority: Mapped[str] = mapped_column(String(50), nullable=False, default="Medium")  # Low, Medium, High, Critical
    risk_criterion: Mapped[str | None] = mapped_column(String(200))
    tna_progress_pct: Mapped[int] = mapped_column(Integer, nullable=False, default=35)
    active_milestone: Mapped[str] = mapped_column(String(150), nullable=False, default="BOM Confirmation")
    
    # 6. Quantities & Commercials (in BDT ৳)
    costing_qty: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("10000.00"))
    projection_qty: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("12000.00"))
    placement_qty: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("10000.00"))
    repeat_order: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    target_fob_bdt: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("850.00"))
    
    # 7. Manufacturing Specifications & Value Additions
    size_range: Mapped[str] = mapped_column(String(100), nullable=False, default="S - XXL")
    size_ratio: Mapped[str] = mapped_column(String(100), nullable=False, default="1:2:2:1")
    value_additions: Mapped[str | None] = mapped_column(String(255))  # Enzyme Wash, Silicon Wash, Chest Print
    has_lining: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    remarks: Mapped[str | None] = mapped_column(Text)

    buyer: Mapped["Buyer | None"] = relationship()
    variants: Mapped[list["StyleVariant"]] = relationship(back_populates="style", cascade="all, delete-orphan")


class StyleVariant(TimestampMixin, Base):
    __tablename__ = "style_variants"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    style_id: Mapped[int] = mapped_column(ForeignKey("styles.id"), nullable=False)
    style_no: Mapped[str | None] = mapped_column(String(100))
    color_id: Mapped[int] = mapped_column(ForeignKey("colors.id"), nullable=False)
    size_id: Mapped[int] = mapped_column(ForeignKey("sizes.id"), nullable=False)
    variant_code: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)

    __table_args__ = (UniqueConstraint("style_id", "color_id", "size_id", name="uq_style_color_size"),)

    style: Mapped["Style"] = relationship(back_populates="variants")
    color: Mapped["Color"] = relationship()
    size: Mapped["Size"] = relationship()
