from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import Role
from app.models.order import OrderStatus
from app.models.bom import BomStatus
from app.models.material_requirement import RequirementStatus
from app.models.inventory import StockCategory, TransactionType
from app.models.procurement import RequisitionStatus, PurchaseOrderStatus, GoodsReceiptStatus
from app.models.production import PlanStatus, WorkOrderStatus, ProductionStage
from app.models.quality import QCType, QCStatus
from app.models.packing import PackingStatus
from app.models.shipment import ShipmentStatus
from app.models.tna import TNAStatus


# ---------- Auth ----------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserOut] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: str
    role: Role = Role.MERCHANDISER


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[Role] = None
    is_active: Optional[bool] = None


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: Role
    is_active: bool
    must_change_password: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PasswordResetRequest(BaseModel):
    new_password: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


# ---------- Master Data ----------
class BuyerBase(BaseModel):
    name: str
    code: str
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    is_active: bool = True


class BuyerCreate(BuyerBase):
    pass


class BuyerUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    is_active: Optional[bool] = None


class BuyerOut(BuyerBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SupplierBase(BaseModel):
    name: str
    code: str
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    payment_terms: Optional[str] = None
    is_active: bool = True


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    payment_terms: Optional[str] = None
    is_active: Optional[bool] = None


class SupplierOut(SupplierBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ColorBase(BaseModel):
    name: str
    code: Optional[str] = None
    hex_code: Optional[str] = None


class ColorCreate(ColorBase):
    pass


class ColorOut(ColorBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class SizeBase(BaseModel):
    name: str
    code: Optional[str] = None
    sort_order: int = 0


class SizeCreate(SizeBase):
    pass


class SizeOut(SizeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class MaterialBase(BaseModel):
    code: str
    name: str
    category: str = "Fabric"
    uom: str
    unit_cost: Decimal = Decimal("0.00")
    currency: str = "USD"
    is_active: bool = True


class MaterialCreate(MaterialBase):
    pass


class MaterialUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    uom: Optional[str] = None
    unit_cost: Optional[Decimal] = None
    currency: Optional[str] = None
    is_active: Optional[bool] = None


class MaterialOut(MaterialBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StyleBase(BaseModel):
    style_no: str
    description: Optional[str] = None
    buyer_id: Optional[int] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True
    style_type: Optional[str] = "Bulk"
    brand: Optional[str] = None
    season: Optional[str] = "SS26"
    sub_category: Optional[str] = None
    gender: Optional[str] = "Men"
    source_allocation: Optional[str] = "Inhouse"
    sam_minutes: Optional[Decimal] = Decimal("15.00")
    target_efficiency_pct: Optional[Decimal] = Decimal("65.00")
    creation_date: Optional[date] = None
    ocd_date: Optional[date] = None
    pcd_date: Optional[date] = None
    ex_factory_date: Optional[date] = None
    pd_merchant_name: Optional[str] = "Sanat Kumar"
    prod_merchant_name: Optional[str] = "Sheela Singh"
    lifecycle_stage: Optional[str] = "ON_ORDER"
    risk_priority: Optional[str] = "Medium"
    risk_criterion: Optional[str] = None
    tna_progress_pct: Optional[int] = 35
    active_milestone: Optional[str] = "BOM Confirmation"
    costing_qty: Optional[Decimal] = Decimal("10000.00")
    projection_qty: Optional[Decimal] = Decimal("12000.00")
    placement_qty: Optional[Decimal] = Decimal("10000.00")
    repeat_order: Optional[bool] = False
    target_fob_bdt: Optional[Decimal] = Decimal("850.00")
    size_range: Optional[str] = "S - XXL"
    size_ratio: Optional[str] = "1:2:2:1"
    value_additions: Optional[str] = None
    has_lining: Optional[bool] = False
    remarks: Optional[str] = None


class StyleCreate(StyleBase):
    pass


class StyleUpdate(BaseModel):
    description: Optional[str] = None
    buyer_id: Optional[int] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class StyleOut(StyleBase):
    id: int
    created_at: datetime
    buyer_name: Optional[str] = None
    variants: List["StyleVariantOut"] = []

    model_config = ConfigDict(from_attributes=True)


class StyleVariantBase(BaseModel):
    style_id: int
    color_id: int
    size_id: int


class StyleVariantCreate(StyleVariantBase):
    pass


class StyleVariantOut(BaseModel):
    id: int
    style_id: int
    color_id: int
    size_id: int
    variant_code: str
    style_no: Optional[str] = None
    color_name: Optional[str] = None
    size_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ---------- Orders ----------
class BuyerOrderItemCreate(BaseModel):
    style_variant_id: int
    quantity: int
    unit_price: Decimal = Decimal("0.0000")
    color_id: Optional[int] = None
    size_id: Optional[int] = None


class BuyerOrderCreate(BaseModel):
    po_number: str
    buyer_id: int
    style_id: int
    order_date: date
    delivery_date: date
    currency: str = "USD"
    status: OrderStatus = OrderStatus.DRAFT
    remarks: Optional[str] = None
    items: List[BuyerOrderItemCreate] = []


class BuyerOrderUpdate(BaseModel):
    delivery_date: Optional[date] = None
    currency: Optional[str] = None
    status: Optional[OrderStatus] = None
    remarks: Optional[str] = None


class BuyerOrderItemOut(BaseModel):
    id: int
    style_variant_id: int
    quantity: int
    unit_price: Decimal
    color_id: Optional[int] = None
    size_id: Optional[int] = None
    variant_code: Optional[str] = None
    color_name: Optional[str] = None
    size_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class BuyerOrderOut(BaseModel):
    id: int
    po_number: str
    buyer_id: int
    style_id: int
    order_date: date
    delivery_date: date
    currency: str
    status: OrderStatus
    remarks: Optional[str] = None
    created_at: datetime
    buyer_name: Optional[str] = None
    style_no: Optional[str] = None
    total_quantity: int = 0
    items: List[BuyerOrderItemOut] = []

    model_config = ConfigDict(from_attributes=True)


# ---------- BOM ----------
class GarmentBomItemCreate(BaseModel):
    material_id: int
    quantity_per_garment: Decimal
    uom: str
    wastage_percent: Decimal = Decimal("0.00")
    is_mandatory: bool = True
    color_id: Optional[int] = None
    size_id: Optional[int] = None
    notes: Optional[str] = None


class GarmentBomCreate(BaseModel):
    style_id: int
    bom_name: str
    version: int = 1
    notes: Optional[str] = None
    items: List[GarmentBomItemCreate] = []


class GarmentBomItemOut(BaseModel):
    id: int
    material_id: int
    quantity_per_garment: Decimal
    uom: str
    wastage_percent: Decimal
    is_mandatory: bool
    color_id: Optional[int] = None
    size_id: Optional[int] = None
    notes: Optional[str] = None
    material_code: Optional[str] = None
    material_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class GarmentBomOut(BaseModel):
    id: int
    style_id: int
    bom_name: str
    version: int
    status: BomStatus
    is_active: bool
    notes: Optional[str] = None
    created_at: datetime
    style_no: Optional[str] = None
    items: List[GarmentBomItemOut] = []

    model_config = ConfigDict(from_attributes=True)


# ---------- Material Requirements ----------
class MaterialRequirementOut(BaseModel):
    id: int
    order_id: int
    material_id: int
    total_order_qty: int
    consumption_per_unit: Decimal
    wastage_percent: Decimal
    required_qty: Decimal
    available_qty: Decimal
    reserved_qty: Decimal
    incoming_qty: Decimal
    shortage_qty: Decimal
    status: RequirementStatus
    po_number: Optional[str] = None
    material_code: Optional[str] = None
    material_name: Optional[str] = None
    category: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ---------- Inventory ----------
class StockBalanceOut(BaseModel):
    id: int
    material_id: Optional[int] = None
    style_variant_id: Optional[int] = None
    category: StockCategory
    quantity: Decimal
    reserved_qty: Decimal
    material_code: Optional[str] = None
    material_name: Optional[str] = None
    variant_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class InventoryTransactionCreate(BaseModel):
    transaction_type: TransactionType
    material_id: Optional[int] = None
    style_variant_id: Optional[int] = None
    category: StockCategory = StockCategory.RAW_MATERIAL
    quantity: Decimal
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    remarks: Optional[str] = None


class InventoryTransactionOut(BaseModel):
    id: int
    transaction_date: datetime
    transaction_type: TransactionType
    material_id: Optional[int] = None
    style_variant_id: Optional[int] = None
    category: StockCategory
    quantity: Decimal
    balance_after: Decimal
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    remarks: Optional[str] = None
    material_code: Optional[str] = None
    material_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ---------- Procurement ----------
class PRItemCreate(BaseModel):
    material_id: int
    quantity: Decimal
    uom: str
    requirement_id: Optional[int] = None
    notes: Optional[str] = None


class PurchaseRequisitionCreate(BaseModel):
    pr_number: str
    order_id: Optional[int] = None
    requested_by: Optional[str] = None
    required_date: Optional[date] = None
    notes: Optional[str] = None
    items: List[PRItemCreate] = []


class PurchaseRequisitionOut(BaseModel):
    id: int
    pr_number: str
    order_id: Optional[int] = None
    requested_by: Optional[str] = None
    required_date: Optional[date] = None
    status: RequisitionStatus
    notes: Optional[str] = None
    created_at: datetime
    items: List["PRItemOut"] = []

    model_config = ConfigDict(from_attributes=True)


class PRItemOut(BaseModel):
    id: int
    material_id: int
    quantity: Decimal
    uom: str
    material_code: Optional[str] = None
    material_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class POItemCreate(BaseModel):
    material_id: int
    quantity: Decimal
    unit_price: Decimal = Decimal("0.0000")
    uom: str
    notes: Optional[str] = None


class PurchaseOrderCreate(BaseModel):
    po_number: str
    supplier_id: int
    requisition_id: Optional[int] = None
    order_date: date
    expected_date: Optional[date] = None
    currency: str = "USD"
    notes: Optional[str] = None
    items: List[POItemCreate] = []


class PurchaseOrderItemOut(BaseModel):
    id: int
    material_id: int
    quantity: Decimal
    received_qty: Decimal
    unit_price: Decimal
    uom: str
    material_code: Optional[str] = None
    material_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PurchaseOrderOut(BaseModel):
    id: int
    po_number: str
    supplier_id: int
    requisition_id: Optional[int] = None
    order_date: date
    expected_date: Optional[date] = None
    currency: str
    status: PurchaseOrderStatus
    notes: Optional[str] = None
    created_at: datetime
    supplier_name: Optional[str] = None
    items: List[PurchaseOrderItemOut] = []

    model_config = ConfigDict(from_attributes=True)


class GRItemCreate(BaseModel):
    po_item_id: int
    material_id: int
    received_qty: Decimal
    accepted_qty: Decimal
    rejected_qty: Decimal = Decimal("0.0000")
    uom: str


class GoodsReceiptCreate(BaseModel):
    gr_number: str
    purchase_order_id: int
    receipt_date: date
    received_by: Optional[str] = None
    notes: Optional[str] = None
    items: List[GRItemCreate] = []


class GoodsReceiptOut(BaseModel):
    id: int
    gr_number: str
    purchase_order_id: int
    receipt_date: date
    status: GoodsReceiptStatus
    received_by: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    po_number: Optional[str] = None
    items: List[GoodsReceiptItemOut] = []

    model_config = ConfigDict(from_attributes=True)


class GoodsReceiptItemOut(BaseModel):
    id: int
    material_id: int
    received_qty: Decimal
    accepted_qty: Decimal
    rejected_qty: Decimal
    uom: str
    material_code: Optional[str] = None
    material_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ---------- Production ----------
class WorkOrderCreate(BaseModel):
    wo_number: str
    plan_id: int
    style_variant_id: int
    quantity: int
    start_date: date
    end_date: date
    notes: Optional[str] = None


class ProductionPlanCreate(BaseModel):
    plan_number: str
    order_id: int
    start_date: date
    end_date: date
    notes: Optional[str] = None


class ProductionPlanOut(BaseModel):
    id: int
    plan_number: str
    order_id: int
    start_date: date
    end_date: date
    status: PlanStatus
    notes: Optional[str] = None
    created_at: datetime
    po_number: Optional[str] = None
    work_orders: List["WorkOrderOut"] = []

    model_config = ConfigDict(from_attributes=True)


class WorkOrderOut(BaseModel):
    id: int
    wo_number: str
    plan_id: int
    style_variant_id: int
    quantity: int
    produced_qty: int
    rejected_qty: int
    start_date: date
    end_date: date
    status: WorkOrderStatus
    notes: Optional[str] = None
    variant_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CuttingEntryCreate(BaseModel):
    work_order_id: int
    entry_date: date
    quantity: int
    rejection_qty: int = 0
    alteration_qty: int = 0
    waste_qty: int = 0
    shift: Optional[str] = None
    operator: Optional[str] = None
    remarks: Optional[str] = None


class SewingEntryCreate(CuttingEntryCreate):
    pass


class FinishingEntryCreate(CuttingEntryCreate):
    pass


class CuttingEntryOut(BaseModel):
    id: int
    work_order_id: int
    entry_date: date
    quantity: int
    rejection_qty: int
    operator: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SewingEntryOut(CuttingEntryOut):
    pass


class FinishingEntryOut(CuttingEntryOut):
    pass


# ---------- Quality ----------
class DefectCreate(BaseModel):
    defect_type: str
    quantity: int
    remarks: Optional[str] = None


class QualityInspectionCreate(BaseModel):
    inspection_number: str
    qc_type: QCType
    work_order_id: Optional[int] = None
    order_id: Optional[int] = None
    style_variant_id: Optional[int] = None
    material_id: Optional[int] = None
    inspected_qty: int = 0
    passed_qty: int = 0
    rejected_qty: int = 0
    inspector: Optional[str] = None
    inspection_date: date
    remarks: Optional[str] = None
    defects: List[DefectCreate] = []


class QualityInspectionOut(BaseModel):
    id: int
    inspection_number: str
    qc_type: QCType
    status: QCStatus
    work_order_id: Optional[int] = None
    order_id: Optional[int] = None
    style_variant_id: Optional[int] = None
    material_id: Optional[int] = None
    inspected_qty: int
    passed_qty: int
    rejected_qty: int
    inspector: Optional[str] = None
    inspection_date: date
    remarks: Optional[str] = None
    created_at: datetime
    defects: List[DefectOut] = []

    model_config = ConfigDict(from_attributes=True)


class DefectOut(BaseModel):
    id: int
    defect_type: str
    quantity: int
    remarks: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ---------- Packing ----------
class PackingListItemCreate(BaseModel):
    carton_no: str
    quantity: int
    size_id: Optional[int] = None
    color_id: Optional[int] = None
    gross_weight: Optional[Decimal] = None
    net_weight: Optional[Decimal] = None
    carton_dimensions: Optional[str] = None


class PackingListCreate(BaseModel):
    packing_number: str
    order_id: int
    style_variant_id: int
    packing_date: date
    warehouse: Optional[str] = None
    remarks: Optional[str] = None
    items: List[PackingListItemCreate] = []


class PackingListOut(BaseModel):
    id: int
    packing_number: str
    order_id: int
    style_variant_id: int
    packing_date: date
    total_cartons: int
    total_quantity: int
    status: PackingStatus
    warehouse: Optional[str] = None
    remarks: Optional[str] = None
    created_at: datetime
    po_number: Optional[str] = None
    items: List[PackingListItemOut] = []

    model_config = ConfigDict(from_attributes=True)


class PackingListItemOut(BaseModel):
    id: int
    carton_no: str
    quantity: int
    size_id: Optional[int] = None
    color_id: Optional[int] = None
    gross_weight: Optional[Decimal] = None
    net_weight: Optional[Decimal] = None
    carton_dimensions: Optional[str] = None
    size_name: Optional[str] = None
    color_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ---------- Shipment ----------
class ShipmentItemCreate(BaseModel):
    style_variant_id: int
    quantity: int
    cartons: int = 0


class ShipmentCreate(BaseModel):
    shipment_number: str
    order_id: int
    packing_list_id: Optional[int] = None
    shipment_date: date
    carrier: Optional[str] = None
    tracking_number: Optional[str] = None
    port_of_loading: Optional[str] = None
    port_of_discharge: Optional[str] = None
    remarks: Optional[str] = None
    items: List[ShipmentItemCreate] = []


class ShipmentOut(BaseModel):
    id: int
    shipment_number: str
    order_id: int
    packing_list_id: Optional[int] = None
    shipment_date: date
    carrier: Optional[str] = None
    tracking_number: Optional[str] = None
    port_of_loading: Optional[str] = None
    port_of_discharge: Optional[str] = None
    status: ShipmentStatus
    remarks: Optional[str] = None
    created_at: datetime
    po_number: Optional[str] = None
    items: List[ShipmentItemOut] = []

    model_config = ConfigDict(from_attributes=True)


class ShipmentItemOut(BaseModel):
    id: int
    style_variant_id: int
    quantity: int
    cartons: int
    variant_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ---------- TNA ----------
class TNAMilestoneCreate(BaseModel):
    milestone_name: str
    planned_date: date
    responsible_person: Optional[str] = None
    remarks: Optional[str] = None


class TNAPlanCreate(BaseModel):
    order_id: int
    plan_name: str
    notes: Optional[str] = None
    milestones: List[TNAMilestoneCreate] = []


class TNAMilestoneOut(BaseModel):
    id: int
    milestone_name: str
    planned_date: date
    actual_date: Optional[date] = None
    status: TNAStatus
    responsible_person: Optional[str] = None
    remarks: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TNAPlanOut(BaseModel):
    id: int
    order_id: int
    plan_name: str
    notes: Optional[str] = None
    created_at: datetime
    po_number: Optional[str] = None
    milestones: List[TNAMilestoneOut] = []

    model_config = ConfigDict(from_attributes=True)


StyleOut.model_rebuild()
ProductionPlanOut.model_rebuild()
BuyerOrderOut.model_rebuild()

# ---------- Logistics & Delivery Challans ----------
class DeliveryChallanBase(BaseModel):
    challan_number: str
    job_number: str
    party_name: str
    delivery_factory: str
    pickup_number: str = "TRUCK-01"
    delivery_date: date
    buyer_name: str
    style_number: str
    po_number: str
    receive_status: str = "NOT_RECEIVED"
    delivery_status: str = "ALL_DELIVERED"
    total_order_qty: Decimal = Decimal("0.00")
    current_delivery_qty: Decimal = Decimal("0.00")
    previous_delivery_qty: Decimal = Decimal("0.00")
    balance_due_qty: Decimal = Decimal("0.00")
    total_packaging_qty: int = 1
    total_amount_bdt: Decimal = Decimal("0.00")
    total_amount_usd: Decimal = Decimal("0.00")
    prepared_by: str = "Md. Mahmudul Hassan Emon"
    security_incharge: str = "Main Gate Security Officer"
    authorized_by: str = "Factory Commercial Manager"
    items_json: Optional[str] = None


class DeliveryChallanCreate(DeliveryChallanBase):
    pass


class DeliveryChallanOut(DeliveryChallanBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class GatePassBase(BaseModel):
    gate_pass_number: str
    pass_date: date
    factory_name: str
    factory_address: str
    pickup_number: str
    driver_name: str = "Abdul Karim"
    driver_phone: str = "+880 1712-345678"
    challans_json: Optional[str] = None
    total_quantity: Decimal = Decimal("0.00")
    total_packaging_qty: int = 0
    prepared_by: str = "Commercial Officer"
    security_incharge: str = "Security Sub-Inspector"
    authorized_by: str = "AGM Production & Security"
    status: str = "GATE_OUT"


class GatePassCreate(GatePassBase):
    pass


class GatePassOut(GatePassBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class MoneyReceiveBase(BaseModel):
    voucher_number: str
    receipt_date: date
    party_name: str
    group_name: Optional[str] = None
    buyer_name: Optional[str] = None
    total_paid_amount: Decimal
    currency: str = "BDT"
    payment_method: str = "AT_SIGHT_LC"
    document_reference: Optional[str] = None
    attachment_name: Optional[str] = None
    remarks: Optional[str] = None
    allocated_challans_json: Optional[str] = None


class MoneyReceiveCreate(MoneyReceiveBase):
    pass


class MoneyReceiveOut(MoneyReceiveBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
