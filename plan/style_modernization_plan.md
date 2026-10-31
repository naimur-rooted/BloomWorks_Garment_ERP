# BloomWorks Garment ERP — Style Lifecycle Modernization Plan
> **Objective**: Modernize BloomWorks' Style Master (`/styles`) into an enterprise-grade garment merchandising portal, adopting the core garment lifecycle workflows from the reference UI while elevating them with modern responsive glassmorphism, real-time T&A progress telemetry, and full BDT (`৳`) currency integration.

---

## 1. Executive Summary & UI Comparison

| Feature | Reference Legacy ERP (YouTube) | BloomWorks Modern Architecture Plan |
| :--- | :--- | :--- |
| **Visual Architecture** | Flat, harsh saturated blocks, rigid grid lines | Aurora Mesh dynamic gradient, frosted glass cards, subtle neon borders |
| **Pipeline Ribbon** | 9 static solid colored boxes side-by-side | Interactive, filterable glass pill-ribbon with counts, badges & hover states |
| **Accountability** | Static text for PD & Bulk Merchandisers | Merchandiser avatars, department badges, and direct contact quick-actions |
| **T&A Telemetry** | Simple progress bar with plain % | Interactive milestone tracker: color-coded health (On-track / Caution / Delayed) |
| **Thumbnail & Tech Pack** | Basic static thumbnail box | High-resolution garment previews, CAD swatch zoom, PDF Tech Pack quick-viewer |
| **Mobile Responsiveness**| Broken on small screens (horizontal overflow) | Responsive card-to-table transition, scrollable mobile filter chips |
| **Financial Standard** | Unspecified / USD | Standardized **Bangladeshi Taka (৳ BDT)** with FOB cost breakdowns |

---

## 2. Core Elements to Adapt

### 2.1. The 9-Stage Style Lifecycle Ribbon
We will implement an interactive status ribbon at the top of the page. Clicking any card filters the style table instantaneously:

```
[ Total (70) ] -> [ New (0) ] -> [ Design/R&D (5) ] -> [ Product Dev (36) ] -> [ Projection (68) ] 
               -> [ On-Order (60) ] -> [ Key Styles (60) ] -> [ Pending POs (13) ] -> [ Un-Shipped (40) ]
```

1. **Total Styles**: Aggregated active style master count.
2. **New Styles**: Draft tech packs created in the current period.
3. **Design & Innovation**: Initial sampling, CAD tech pack drafting, fabric strike-off approval.
4. **Product Development**: Fit sample, proto sample, size set approval stage.
5. **Projection**: Pre-order merchant forecast with estimated fabric & trim consumption.
6. **On-Order**: Confirmed buyer orders with valid factory order numbers.
7. **Key Styles**: High-volume core running styles (runner programs).
8. **Pending POs (Alert State)**: Styles where tech packs are ready but buyer PO numbers/allocations are blocked.
9. **Un-Shipped**: Bulk production active in Cutting, Sewing, or Finishing floors.

---

### 2.2. Dual Merchandiser Ownership Matrix
Real garment manufacturing relies on two distinct merchandising roles:
- **PD Merchandiser (Product Development)**: Handles R&D, buyer design briefs, sample approvals, lab dips, strike-offs, and costing.
- **Bulk Production Merchandiser**: Takes over once the PO is locked, managing critical path T&A, trim inventory, production lines, and shipment.

**Adaptation**: We will add fields `pd_merchant_id` and `prod_merchant_id` to the Style model, displaying both merchandisers with avatars and quick email/telecom action links.

---

### 2.3. Time & Action (T&A) Telemetry & Risk Priority
Every row in the reference table displays:
- **Risk Priority**: `Low` (Green), `Medium` (Blue), `High` (Amber), `Critical` (Rose).
- **T&A Progress Bar**: Visual percentage completion of all pre-production milestones.
- **Current Blocker / Milestone Status**: e.g., `Lab Dip Approval Date For Fabric`, `BOM Confirmation`, `Size Set Approval`.

---

## 3. UI/UX Component Architecture

### 3.1. Filter & Search Control Bar
- **Fast Search Input**: Instant debounce search on Style #, Buyer, Style Name.
- **Buyer Multi-select**: Filter by H&M, Zara, Target, M&S, etc.
- **Garment Category**: Filter by Tops, Bottoms, Outerwear, Knitwear, Denim.
- **Date Range Picker**: From Date $\rightarrow$ To Date based on Order Confirmation or Ex-factory date.
- **Action Buttons**:
  - `+ New Style Tech Pack` (Opens modernized sliding drawer or modal).
  - `Export Tech Pack Matrix (Excel/PDF)`.

---

### 3.2. Modernized Table Columns

```
+---------------------------------------------------------------------------------------------------+
| Thumbnail | Style# & Type | Style Description | PD / Bulk Merchant | T&A Progress | Active Milestone | Actions |
+---------------------------------------------------------------------------------------------------+
```

1. **Garment Thumbnail**:
   - High-fidelity zoom-on-hover preview.
   - Placeholder SVG generator if no tech pack sketch is uploaded.
2. **Style Code & Badges**:
   - Primary Style Code (`#STYLE-1650`).
   - Facility Origin: `In-House` (Green pill) or `Subcontracted` (Amber pill).
   - Tech pack stages: `[T]` (Tech Pack Approved), `[P]` (Pattern Master Ready).
3. **Style Description & Buyer**:
   - Style Name (e.g. `Apparel Cargo Pants 6-Pocket`).
   - Buyer Tag Pill with brand colors.
4. **Merchandiser Accountability**:
   - Compact stacked view:
     - `PD: Sanat Kumar`
     - `Bulk: Sheela Singh`
5. **T&A Health & Risk**:
   - Visual gradient progress bar (e.g., `63%`).
   - Priority Tag (`Critical`, `Medium`, `Low`).
6. **Active Milestone**:
   - Bold status chip displaying the next gating task (e.g. `BOM Finalized`, `Lab Dip Approved`).
7. **Quick Action Context Menu**:
   - `BOM Spec`, `Critical Path T&A`, `Costing Sheet (BDT)`, `View Tech Pack PDF`.

---

## 4. Backend Database Schema Extensions

To support this modern workflow, the `Style` model in `backend/app/models/master.py` will be enriched:

```python
class StyleLifecycleStage(str, Enum):
    NEW = "New Style"
    DESIGN = "Design & Innovation"
    PRODUCT_DEV = "Product Development"
    PROJECTION = "Projection"
    ON_ORDER = "On-Order"
    KEY_STYLE = "Key Style"
    PENDING_PO = "Pending PO"
    UN_SHIPPED = "Un-Shipped"
    COMPLETED = "Completed"

class StyleRiskPriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

# Model additions on Style:
# - lifecycle_stage: StyleLifecycleStage (default: DESIGN)
# - pd_merchant_name: str
# - prod_merchant_name: str
# - risk_priority: StyleRiskPriority (default: MEDIUM)
# - active_milestone: str (e.g. "Lab Dip Approval", "BOM")
# - tna_progress_pct: int (0 to 100)
# - fob_price_bdt: Decimal (Unit FOB in BDT ৳)
# - is_inhouse: bool (True for in-house, False for outsourced)
```

---

## 5. Phased Implementation Roadmap

### Phase 1: Database & API Enrichment
- Add lifecycle, merchandiser, and milestone columns to `Style` model.
- Add mock/sample data seed representing realistic Bangladesh factory styles (Denim Pants, Pique Polo, Oversized Cargo).
- Expose summary stats endpoint `GET /api/styles/summary` to drive the 9-stage ribbon counts.

### Phase 2: Frontend Pipeline Ribbon & Filters
- Build the 9-card interactive KPI ribbon with fluid micro-animations.
- Implement multi-criteria filtering (Buyer, Category, Merchandiser, Date).

### Phase 3: Modern Data Grid & Detail Drawer
- Build the high-density garment table with thumbnail previews, badges, dual merchandiser cells, and T&A progress bars.
- Add a sliding "Tech Pack Quick Drawer" showing BOM breakdown, colorway swatches, and piece-rate cost in BDT (`৳`).

### Phase 4: Production Verification & Mobile Adaptability
- Test full responsiveness across desktop, tablet, and mobile displays.
- Deploy to Vercel and verify instant load speeds.
