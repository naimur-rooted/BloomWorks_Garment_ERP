"""
Seed comprehensive, production-ready demonstration dataset for NextGen Garments Ltd.
(Dhaka, Bangladesh).
Idempotent: safe to run multiple times without duplicating data.
"""
from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import Role, User
from app.models.master import Buyer, Supplier, Color, Size, Material, Style, StyleVariant
from app.models.order import BuyerOrder, BuyerOrderItem, OrderStatus
from app.models.tna import TNAPlan, TNAMilestone
from app.models.bom import GarmentBom, GarmentBomItem
from app.models.material_requirement import MaterialRequirement, RequirementStatus
from app.models.procurement import (
    PurchaseRequisition,
    PurchaseRequisitionItem,
    PurchaseOrder,
    PurchaseOrderItem,
    GoodsReceipt,
    GoodsReceiptItem,
    RequisitionStatus,
    PurchaseOrderStatus,
    GoodsReceiptStatus,
)
from app.models.inventory import StockBalance, InventoryTransaction
from app.models.production import (
    ProductionPlan,
    WorkOrder,
    CuttingEntry,
    SewingEntry,
    FinishingEntry,
    PlanStatus,
    WorkOrderStatus,
)
from app.models.quality import QualityInspection, Defect
from app.models.packing import PackingList, PackingListItem
from app.models.shipment import Shipment, ShipmentItem


def seed_users(db: Session):
    print("--> Seeding Role-Specific Demo Users...")
    users_data = [
        ("admin", "admin123", "admin@nextgen.com", "System Administrator", Role.ADMIN),
        ("merchandiser", "demo123", "merch@nextgen.com", "Sarah Ahmed (Sr. Merchandiser)", Role.MERCHANDISER),
        ("production", "demo123", "prod@nextgen.com", "Tariqul Islam (Production Manager)", Role.PRODUCTION_MANAGER),
        ("cutting", "demo123", "cutting@nextgen.com", "Kamal Hosain (Cutting Supervisor)", Role.CUTTING_SUPERVISOR),
        ("sewing", "demo123", "sewing@nextgen.com", "Nasrin Akter (Sewing Line Supervisor)", Role.SEWING_SUPERVISOR),
        ("finishing", "demo123", "finishing@nextgen.com", "Rafiqul Alam (Finishing Supervisor)", Role.FINISHING_SUPERVISOR),
        ("quality", "demo123", "quality@nextgen.com", "Monir Hossain (Chief Quality Inspector)", Role.QUALITY_INSPECTOR),
        ("inventory", "demo123", "inventory@nextgen.com", "Abul Kalam (Store & Inventory Officer)", Role.STORE_OFFICER),
        ("procurement", "demo123", "procurement@nextgen.com", "Farhana Yasmin (Procurement Officer)", Role.PROCUREMENT_OFFICER),
    ]

    for username, password, email, full_name, role in users_data:
        existing = db.query(User).filter(User.username == username).first()
        if not existing:
            user = User(
                username=username,
                email=email,
                full_name=full_name,
                hashed_password=get_password_hash(password),
                role=role,
                is_active=True,
            )
            db.add(user)
    db.commit()


def seed_garment_demo_workflow(db: Session):
    print("--> Seeding NextGen Garments Ltd. Master & Workflow Data...")

    # 1. Buyers (6 Global Fashion Brands)
    buyers_data = [
        ("BUY-001", "H&M Hennes & Mauritz GBC AB", "Anna Andersson", "anna.demo@hm.com", "+46 8 796 5500", "Sweden", "Mäster Samuelsgatan 46A, Stockholm"),
        ("BUY-002", "Zara / Inditex Group", "Carlos Gomez", "carlos.gomez@inditex.com", "+34 981 185 400", "Spain", "Avenida de la Diputacion, Edificio Inditex, Arteixo"),
        ("BUY-003", "PVH / Tommy Hilfiger", "Michael Van Dijk", "michael.vandijk@pvh.com", "+31 20 589 5000", "Netherlands", "Danzigerkade 165, Amsterdam"),
        ("BUY-004", "Marks & Spencer PLC", "Claire Davenport", "claire.d@marksandspencer.com", "+44 20 7935 4422", "United Kingdom", "Waterside House, 35 North Wharf Rd, London"),
        ("BUY-005", "Target Corporation", "Robert Jenkins", "r.jenkins@target.com", "+1 612 304 6073", "United States", "1000 Nicollet Mall, Minneapolis, MN"),
        ("BUY-006", "Uniqlo / Fast Retailing", "Kenji Takahashi", "k.takahashi@fastretailing.com", "+81 3 6865 0050", "Japan", "Midtown Tower, Akasaka, Minato-ku, Tokyo"),
    ]
    buyers = {}
    for code, name, contact, email, phone, country, addr in buyers_data:
        b = db.query(Buyer).filter(Buyer.code == code).first()
        if not b:
            b = Buyer(code=code, name=name, contact_person=contact, email=email, phone=phone, country=country, address=addr, is_active=True)
            db.add(b)
            db.commit()
            db.refresh(b)
        buyers[code] = b

    # 2. Industrial Suppliers (Fabric, Yarn, Trims, Packaging)
    suppliers_data = [
        ("SUP-001", "Aman Spinning Mills Ltd.", "Rafiqul Aman", "aman@amanspinning.com", "Gazipur, Bangladesh", "30 Days Net"),
        ("SUP-002", "Square Textiles Ltd.", "Tariq Mahmud", "tariq@squaregroup.com", "Bhaluka, Mymensingh, Bangladesh", "60 Days Deferred LC"),
        ("SUP-003", "Pioneer Denim Mills Ltd.", "Badsha Mia", "badsha@pioneerdenim.com", "Habiganj, Sylhet, Bangladesh", "45 Days Net"),
        ("SUP-004", "YKK Bangladesh Fastening Solutions", "Takeshi Mori", "t.mori@ykkbd.com", "DEPZ, Savar, Dhaka, Bangladesh", "30 Days Net"),
        ("SUP-005", "Coats Bangladesh Ltd.", "Tanvir Hasan", "tanvir.hasan@coats.com", "Chittagong EPZ, Bangladesh", "30 Days Net"),
        ("SUP-006", "Paxar Avery Dennison BD", "Sayeed Alam", "s.alam@averydennison.com", "Uttara EPZ, Nilphamari, Bangladesh", "15 Days Net"),
        ("SUP-007", "Dhaka Accessories & Trims Ltd.", "Kamal Hosain", "kamal@dhakaacc.com", "Tongi, Gazipur, Bangladesh", "Cash on Delivery"),
        ("SUP-008", "Global Packaging Solutions Ltd.", "Mizanur Rahman", "mizan@globalpkg.com", "Narayanganj, Bangladesh", "15 Days Net"),
    ]
    suppliers = {}
    for code, name, contact, email, address, terms in suppliers_data:
        sup = db.query(Supplier).filter(Supplier.code == code).first()
        if not sup:
            sup = Supplier(code=code, name=name, contact_person=contact, email=email, address=address, payment_terms=terms, is_active=True)
            db.add(sup)
            db.commit()
            db.refresh(sup)
        suppliers[code] = sup

    # 3. Colors & Sizes
    colors_data = [
        ("Navy Blue", "NAVY", "#001F3F"),
        ("Optic White", "WHITE", "#FFFFFF"),
        ("Vintage Indigo", "INDIGO", "#2E4A62"),
        ("Heather Grey", "GREY", "#A8A8A8"),
        ("Crimson Red", "RED", "#990000"),
        ("Sand Dune Khaki", "KHAKI", "#C2B280"),
        ("Sage Green", "SAGE", "#778877"),
        ("Jet Black", "BLACK", "#111111"),
        ("Royal Cobalt", "COBALT", "#0047AB"),
        ("Dusty Rose", "ROSE", "#DCAE96"),
    ]
    colors = {}
    for name, code, hex_c in colors_data:
        c = db.query(Color).filter(Color.name == name).first()
        if not c:
            c = Color(name=name, code=code, hex_code=hex_c)
            db.add(c)
            db.commit()
            db.refresh(c)
        colors[code] = c

    sizes_data = [
        ("XS", "XS", 1),
        ("S", "S", 2),
        ("M", "M", 3),
        ("L", "L", 4),
        ("XL", "XL", 5),
        ("XXL", "XXL", 6),
        ("3XL", "3XL", 7),
        ("30", "30", 8),
        ("32", "32", 9),
        ("34", "34", 10),
        ("36", "36", 11),
        ("38", "38", 12),
    ]
    sizes = {}
    for code, name, sort_order in sizes_data:
        sz = db.query(Size).filter(Size.name == name).first()
        if not sz:
            sz = Size(name=name, code=code, sort_order=sort_order)
            db.add(sz)
            db.commit()
            db.refresh(sz)
        sizes[code] = sz

    # 4. Materials (Fabrics, Trims, Packaging)
    materials_data = [
        ("MAT-FAB-001", "100% Combed Cotton Pique Fabric (220 GSM)", "Fabric", "kg", Decimal("5.50")),
        ("MAT-FAB-002", "12.5oz Ring Spun Cotton Elastane Denim Twill", "Fabric", "yds", Decimal("4.20")),
        ("MAT-FAB-003", "340 GSM 100% Cotton French Terry Brushed Fleece", "Fabric", "kg", Decimal("6.80")),
        ("MAT-FAB-004", "100% Pure Washed Linen Plain Weave (165 GSM)", "Fabric", "yds", Decimal("5.90")),
        ("MAT-FAB-005", "Cotton Spandex Stretch Twill Chino (240 GSM)", "Fabric", "yds", Decimal("3.85")),
        ("MAT-FAB-006", "380T Nylon Ripstop Water-Repellent Shell", "Fabric", "yds", Decimal("2.95")),
        ("MAT-THR-001", "40/2 Polyester Spun Sewing Thread (Navy)", "Thread", "roll", Decimal("1.20")),
        ("MAT-THR-002", "30/3 Heavy Duty Denim Topstitch Thread (Gold)", "Thread", "roll", Decimal("1.80")),
        ("MAT-BTN-001", "18L 3-Hole Natural Pearl Buttons", "Button", "pcs", Decimal("0.05")),
        ("MAT-BTN-002", "27L Antique Brass Shank Buttons for Denim", "Button", "pcs", Decimal("0.12")),
        ("MAT-ZIP-001", "#5 Antique Brass Metal Zipper (7 inch)", "Zipper", "pcs", Decimal("0.45")),
        ("MAT-LBL-001", "Main Woven Brand Label", "Label", "pcs", Decimal("0.10")),
        ("MAT-LBL-002", "Size & Fit Woven Damask Label", "Label", "pcs", Decimal("0.02")),
        ("MAT-LBL-003", "Care, Content & Country of Origin Printed Label", "Label", "pcs", Decimal("0.03")),
        ("MAT-TAG-001", "Retail Price & Barcode Hang Tag with Cotton String", "Accessory", "pcs", Decimal("0.08")),
        ("MAT-PKG-001", "Recycled Self-Adhesive Poly Bag with Warning Logo", "Packaging", "pcs", Decimal("0.04")),
        ("MAT-PKG-002", "7-Ply Heavy Duty Export Carton (60x40x30 cm)", "Packaging", "pcs", Decimal("1.50")),
    ]
    mat_map = {}
    for code, name, cat, uom, cost in materials_data:
        m = db.query(Material).filter(Material.code == code).first()
        if not m:
            m = Material(code=code, name=name, category=cat, uom=uom, unit_cost=cost, currency="USD", is_active=True)
            db.add(m)
            db.commit()
            db.refresh(m)
        mat_map[code] = m

    # 5. Styles (6 Major Product Lines)
    styles_info = [
        ("NG-POLO-001", "Men's Classic Cotton Pique Polo Shirt with 3-Button Placket", buyers["BUY-001"].id, "Knitwear", "NAVY", ["S", "M", "L", "XL"]),
        ("NG-DENIM-002", "Men's 5-Pocket Slim Fit Enzyme Stone Washed Denim Jeans", buyers["BUY-002"].id, "Woven Denim", "INDIGO", ["30", "32", "34", "36", "38"]),
        ("NG-HOODIE-003", "Unisex Premium Heavyweight French Terry Pullover Hoodie", buyers["BUY-003"].id, "Fleece Knit", "GREY", ["XS", "S", "M", "L", "XL", "XXL"]),
        ("NG-SHIRT-004", "Men's Casual Relaxed Fit Pure Linen Button-Down Shirt", buyers["BUY-004"].id, "Woven Tops", "WHITE", ["S", "M", "L", "XL"]),
        ("NG-CHINO-005", "Utility Stretch Casual Flat-Front Chino Shorts", buyers["BUY-005"].id, "Bottoms", "KHAKI", ["30", "32", "34", "36"]),
        ("NG-JACKET-006", "Ultra-Light Packable Quilted Diamond Puff Jacket", buyers["BUY-006"].id, "Outerwear", "BLACK", ["S", "M", "L", "XL", "XXL"]),
    ]

    styles = {}
    style_variants = {}
    for sno, desc, b_id, cat, primary_color_code, size_codes in styles_info:
        st = db.query(Style).filter(Style.style_no == sno).first()
        if not st:
            st = Style(style_no=sno, description=desc, buyer_id=b_id, category=cat, is_active=True)
            db.add(st)
            db.commit()
            db.refresh(st)
        styles[sno] = st

        # Variants
        c_obj = colors.get(primary_color_code, colors["NAVY"])
        for sz_c in size_codes:
            sz_obj = sizes[sz_c]
            vcode = f"{sno}-{primary_color_code}-{sz_c}"
            var = db.query(StyleVariant).filter(StyleVariant.variant_code == vcode).first()
            if not var:
                var = StyleVariant(
                    style_id=st.id,
                    style_no=st.style_no,
                    color_id=c_obj.id,
                    size_id=sz_obj.id,
                    variant_code=vcode,
                )
                db.add(var)
                db.commit()
                db.refresh(var)
            style_variants[vcode] = var

        # Garment BOM
        bom = db.query(GarmentBom).filter(GarmentBom.style_id == st.id).first()
        if not bom:
            bom = GarmentBom(
                style_id=st.id,
                bom_name=f"Standard BOM for {sno} V1.0",
                version=1,
                status="Active",
                is_active=True,
                notes=f"Export grade Bill of Materials for {sno}",
            )
            db.add(bom)
            db.commit()
            db.refresh(bom)

            # Common items
            db.add(GarmentBomItem(bom_id=bom.id, material_id=mat_map["MAT-THR-001"].id, quantity_per_garment=Decimal("0.05"), uom="roll", wastage_percent=Decimal("2.0")))
            db.add(GarmentBomItem(bom_id=bom.id, material_id=mat_map["MAT-LBL-001"].id, quantity_per_garment=Decimal("1.0"), uom="pcs", wastage_percent=Decimal("1.0")))
            db.add(GarmentBomItem(bom_id=bom.id, material_id=mat_map["MAT-LBL-002"].id, quantity_per_garment=Decimal("1.0"), uom="pcs", wastage_percent=Decimal("1.0")))
            db.add(GarmentBomItem(bom_id=bom.id, material_id=mat_map["MAT-LBL-003"].id, quantity_per_garment=Decimal("1.0"), uom="pcs", wastage_percent=Decimal("1.0")))
            db.add(GarmentBomItem(bom_id=bom.id, material_id=mat_map["MAT-TAG-001"].id, quantity_per_garment=Decimal("1.0"), uom="pcs", wastage_percent=Decimal("1.0")))
            db.add(GarmentBomItem(bom_id=bom.id, material_id=mat_map["MAT-PKG-001"].id, quantity_per_garment=Decimal("1.0"), uom="pcs", wastage_percent=Decimal("2.0")))
            db.add(GarmentBomItem(bom_id=bom.id, material_id=mat_map["MAT-PKG-002"].id, quantity_per_garment=Decimal("0.02"), uom="pcs", wastage_percent=Decimal("0.0")))
            db.commit()

    # 6. Orders (6 Multi-Stage Factory Orders)
    orders_data = [
        ("PO-2026-001", "BUY-001", "NG-POLO-001", date(2026, 1, 10), date(2026, 4, 15), OrderStatus.IN_PRODUCTION, Decimal("6.50"), 10000, "NAVY", ["S", "M", "L", "XL"]),
        ("PO-2026-002", "BUY-002", "NG-DENIM-002", date(2026, 1, 20), date(2026, 5, 10), OrderStatus.IN_PRODUCTION, Decimal("14.80"), 8000, "INDIGO", ["30", "32", "34", "36", "38"]),
        ("PO-2026-003", "BUY-003", "NG-HOODIE-003", date(2026, 2, 1), date(2026, 5, 25), OrderStatus.IN_PRODUCTION, Decimal("18.20"), 6000, "GREY", ["XS", "S", "M", "L", "XL", "XXL"]),
        ("PO-2026-004", "BUY-004", "NG-SHIRT-004", date(2026, 2, 15), date(2026, 6, 1), OrderStatus.CONFIRMED, Decimal("12.50"), 5000, "WHITE", ["S", "M", "L", "XL"]),
        ("PO-2026-005", "BUY-005", "NG-CHINO-005", date(2026, 2, 20), date(2026, 6, 15), OrderStatus.CONFIRMED, Decimal("9.75"), 7500, "KHAKI", ["30", "32", "34", "36"]),
        ("PO-2026-006", "BUY-006", "NG-JACKET-006", date(2026, 3, 1), date(2026, 7, 10), OrderStatus.DRAFT, Decimal("24.00"), 4000, "BLACK", ["S", "M", "L", "XL", "XXL"]),
    ]

    orders = {}
    for po_num, b_code, s_code, o_date, d_date, status, unit_price, total_qty, col_code, sz_list in orders_data:
        ord_obj = db.query(BuyerOrder).filter(BuyerOrder.po_number == po_num).first()
        if not ord_obj:
            b_obj = buyers[b_code]
            s_obj = styles[s_code]
            ord_obj = BuyerOrder(
                po_number=po_num,
                buyer_id=b_obj.id,
                style_id=s_obj.id,
                order_date=o_date,
                delivery_date=d_date,
                currency="USD",
                status=status,
                remarks=f"Commercial Production Order {po_num} for {b_obj.name} ({s_obj.description})",
            )
            db.add(ord_obj)
            db.commit()
            db.refresh(ord_obj)

            # Order items split across sizes
            qty_per_size = total_qty // len(sz_list)
            for sz_c in sz_list:
                vcode = f"{s_code}-{col_code}-{sz_c}"
                var_obj = style_variants.get(vcode)
                if var_obj:
                    item = BuyerOrderItem(
                        order_id=ord_obj.id,
                        style_variant_id=var_obj.id,
                        quantity=qty_per_size,
                        unit_price=unit_price,
                        color_id=colors[col_code].id,
                        size_id=sizes[sz_c].id,
                    )
                    db.add(item)
            db.commit()
        orders[po_num] = ord_obj

        # TNA Plan
        tna = db.query(TNAPlan).filter(TNAPlan.order_id == ord_obj.id).first()
        if not tna:
            tna = TNAPlan(order_id=ord_obj.id, plan_name=f"Master T&A Milestone Plan for {po_num}", notes=f"TNA schedule for {po_num}")
            db.add(tna)
            db.commit()
            db.refresh(tna)

            milestones = [
                ("Order Confirmation & Specs Freeze", o_date, o_date + timedelta(days=3), "Completed"),
                ("Fabric Lab Dip & Strike-Off Approval", o_date + timedelta(days=5), o_date + timedelta(days=10), "Completed"),
                ("Raw Materials In-House & 4-Point Inspection", o_date + timedelta(days=15), o_date + timedelta(days=22), "Completed" if status == OrderStatus.IN_PRODUCTION else "On Track"),
                ("Pre-Production (PP) Meeting & Pilot Run", o_date + timedelta(days=25), o_date + timedelta(days=28), "Completed" if status == OrderStatus.IN_PRODUCTION else "On Track"),
                ("Bulk Spreading & Precision Cutting", o_date + timedelta(days=30), o_date + timedelta(days=38), "In Progress" if status == OrderStatus.IN_PRODUCTION else "Pending"),
                ("Sewing Line Loading & Assembly", o_date + timedelta(days=38), o_date + timedelta(days=55), "In Progress" if status == OrderStatus.IN_PRODUCTION else "Pending"),
                ("Wet Processing / Laundry & Ironing", o_date + timedelta(days=55), o_date + timedelta(days=65), "Pending"),
                ("Final Pre-Shipment Quality Audit (AQL 2.5)", d_date - timedelta(days=7), d_date - timedelta(days=5), "Pending"),
                ("Ex-Factory Handover & Vessel Departure", d_date - timedelta(days=3), d_date, "On Track"),
            ]
            for m_name, p_start, p_end, m_status in milestones:
                db.add(TNAMilestone(
                    tna_plan_id=tna.id,
                    milestone_name=m_name,
                    planned_date=p_start,
                    actual_date=p_start if m_status == "Completed" else None,
                    status=m_status,
                ))
            db.commit()

        # Material Requirements (MRP)
        mrp_exists = db.query(MaterialRequirement).filter(MaterialRequirement.order_id == ord_obj.id).first()
        if not mrp_exists:
            fab_code = "MAT-FAB-001" if "POLO" in s_code else "MAT-FAB-002" if "DENIM" in s_code else "MAT-FAB-003"
            req_qty = Decimal(str(total_qty * 0.35))
            db.add(MaterialRequirement(
                order_id=ord_obj.id,
                material_id=mat_map[fab_code].id,
                total_order_qty=total_qty,
                consumption_per_unit=Decimal("0.3500"),
                wastage_percent=Decimal("4.00"),
                required_qty=req_qty,
                available_qty=req_qty,
                reserved_qty=req_qty,
                incoming_qty=Decimal("0.0000"),
                shortage_qty=Decimal("0.0000"),
                status=RequirementStatus.FULFILLED if status == OrderStatus.IN_PRODUCTION else RequirementStatus.OPEN,
            ))
            db.add(MaterialRequirement(
                order_id=ord_obj.id,
                material_id=mat_map["MAT-THR-001"].id,
                total_order_qty=total_qty,
                consumption_per_unit=Decimal("0.0500"),
                wastage_percent=Decimal("2.00"),
                required_qty=Decimal(str(total_qty * 0.05)),
                available_qty=Decimal(str(total_qty * 0.05)),
                reserved_qty=Decimal(str(total_qty * 0.05)),
                incoming_qty=Decimal("0.0000"),
                shortage_qty=Decimal("0.0000"),
                status=RequirementStatus.FULFILLED,
            ))
            db.commit()

    # 7. Procurement Requisitions & POs
    for i, po_key in enumerate(["PO-2026-001", "PO-2026-002", "PO-2026-003"]):
        ord_obj = orders[po_key]
        pr_code = f"PR-2026-{i+1:03d}"
        pr = db.query(PurchaseRequisition).filter(PurchaseRequisition.pr_number == pr_code).first()
        if not pr:
            pr = PurchaseRequisition(
                pr_number=pr_code,
                order_id=ord_obj.id,
                requested_by="Sarah Ahmed (Sr. Merchandiser)",
                required_date=ord_obj.order_date + timedelta(days=20),
                status=RequisitionStatus.APPROVED,
                notes=f"Raw materials procurement for {po_key}",
            )
            db.add(pr)
            db.commit()
            db.refresh(pr)

            sup_key = "SUP-001" if i == 0 else "SUP-003" if i == 1 else "SUP-002"
            sup = suppliers[sup_key]
            po_proc = PurchaseOrder(
                po_number=f"MPO-2026-{i+1:03d}",
                supplier_id=sup.id,
                requisition_id=pr.id,
                order_date=ord_obj.order_date + timedelta(days=5),
                expected_date=ord_obj.order_date + timedelta(days=20),
                currency="USD",
                status=PurchaseOrderStatus.RECEIVED,
                notes=f"Commercial Purchase Order for {sup.name}",
            )
            db.add(po_proc)
            db.commit()
            db.refresh(po_proc)

            grn = GoodsReceipt(
                gr_number=f"GRN-2026-{i+1:03d}",
                purchase_order_id=po_proc.id,
                receipt_date=ord_obj.order_date + timedelta(days=19),
                status=GoodsReceiptStatus.POSTED,
                received_by="Abul Kalam (Store Officer)",
                notes="Warehouse Bay 04 - Raw Material Staging QC Passed",
            )
            db.add(grn)
            db.commit()

    # 8. Production Work Orders, Cutting, Sewing, Finishing
    for i, po_key in enumerate(["PO-2026-001", "PO-2026-002"]):
        ord_obj = orders[po_key]
        plan_num = f"PLN-2026-{i+1:03d}"
        plan = db.query(ProductionPlan).filter(ProductionPlan.plan_number == plan_num).first()
        if not plan:
            plan = ProductionPlan(
                plan_number=plan_num,
                order_id=ord_obj.id,
                start_date=ord_obj.order_date + timedelta(days=25),
                end_date=ord_obj.delivery_date - timedelta(days=10),
                status=PlanStatus.IN_PROGRESS,
                notes=f"Production Execution Plan for {po_key}",
            )
            db.add(plan)
            db.commit()
            db.refresh(plan)

        wo_num = f"WO-2026-{i+1:03d}"
        wo = db.query(WorkOrder).filter(WorkOrder.wo_number == wo_num).first()
        if not wo:
            sample_variant = db.query(StyleVariant).filter(StyleVariant.style_id == ord_obj.style_id).first()
            wo = WorkOrder(
                wo_number=wo_num,
                plan_id=plan.id,
                style_variant_id=sample_variant.id if sample_variant else 1,
                quantity=8000 if i == 0 else 6000,
                produced_qty=3200,
                rejected_qty=42,
                start_date=plan.start_date,
                end_date=plan.end_date,
                status=WorkOrderStatus.IN_PROGRESS,
                notes=f"Floor Work Order for {po_key}",
            )
            db.add(wo)
            db.commit()
            db.refresh(wo)

            # Cutting entry
            db.add(CuttingEntry(
                work_order_id=wo.id,
                entry_date=wo.start_date + timedelta(days=2),
                quantity=4000,
                rejection_qty=24,
                shift="Morning Shift A",
                operator="Kamal Hosain (Cutting Supervisor)",
                remarks="Automatic Spreader + Eastman Knife Cut",
            ))
            # Sewing entry
            db.add(SewingEntry(
                work_order_id=wo.id,
                entry_date=wo.start_date + timedelta(days=10),
                quantity=3650,
                rejection_qty=42,
                shift="General Shift",
                operator="Nasrin Akter (Sewing Supervisor)",
                remarks="Lines 02 & 04 Combined Production",
            ))
            # Finishing entry
            db.add(FinishingEntry(
                work_order_id=wo.id,
                entry_date=wo.start_date + timedelta(days=18),
                quantity=3200,
                rejection_qty=18,
                shift="General Shift",
                operator="Rafiqul Alam (Finishing Supervisor)",
                remarks="Steam Ironing & Hangtag Attaching",
            ))
            db.commit()

    print("--> Master Garment ERP Workflow Successfully Seeded with 6 Buyers, 8 Suppliers, 6 Styles, and Orders!")


def main():
    from app.db.base import Base
    from app.db.session import engine
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_users(db)
        seed_garment_demo_workflow(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
