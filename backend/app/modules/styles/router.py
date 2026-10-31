from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.master import Style, StyleVariant, Color, Size, Buyer
from app.models.user import User
from app.schemas.schemas import StyleCreate, StyleOut, StyleUpdate, StyleVariantCreate, StyleVariantOut

router = APIRouter(prefix="/styles", tags=["Styles"])


def _to_style(db: Session, style: Style) -> StyleOut:
    out = StyleOut.model_validate(style)
    if style.buyer_id:
        buyer = db.query(Buyer).filter(Buyer.id == style.buyer_id).first()
        out.buyer_name = buyer.name if buyer else None
    variants = []
    for v in style.variants:
        vo = StyleVariantOut.model_validate(v)
        color = db.query(Color).filter(Color.id == v.color_id).first()
        size = db.query(Size).filter(Size.id == v.size_id).first()
        vo.color_name = color.name if color else None
        vo.size_name = size.name if size else None
        variants.append(vo)
    out.variants = variants
    return out


@router.get("/summary")
def get_styles_summary(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    styles = db.query(Style).all()
    total = len(styles)
    new_style = sum(1 for s in styles if (s.lifecycle_stage or "").upper() in ["NEW", "NEW_STYLE"])
    design = sum(1 for s in styles if (s.lifecycle_stage or "").upper() in ["DESIGN", "DESIGN_INNOVATION"])
    pd = sum(1 for s in styles if (s.lifecycle_stage or "").upper() in ["PD", "PRODUCT_DEV", "PRODUCT_DEVELOPMENT"])
    projection = sum(1 for s in styles if (s.lifecycle_stage or "").upper() in ["PROJECTION"])
    on_order = sum(1 for s in styles if (s.lifecycle_stage or "").upper() in ["ON_ORDER", "ON ORDER"])
    key_styles = sum(1 for s in styles if (s.lifecycle_stage or "").upper() in ["KEY_STYLES", "KEY STYLES"] or (s.risk_priority or "").upper() == "HIGH")
    pending_pos = sum(1 for s in styles if (s.lifecycle_stage or "").upper() in ["PENDING_POS", "PENDING_PO"])
    un_shipped = sum(1 for s in styles if (s.lifecycle_stage or "").upper() in ["UN_SHIPPED", "UNSHIPPED", "IN_PRODUCTION"])
    return {
        "total": total,
        "new_style": new_style,
        "design_innovation": design,
        "product_dev": pd,
        "projection": projection,
        "on_order": on_order,
        "key_styles": key_styles,
        "pending_pos": pending_pos,
        "un_shipped": un_shipped,
    }


@router.get("", response_model=list[StyleOut])
def list_styles(
    lifecycle_stage: Optional[str] = Query(None),
    buyer_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Style)
    if lifecycle_stage:
        query = query.filter(Style.lifecycle_stage.ilike(f"%{lifecycle_stage}%"))
    if buyer_id:
        query = query.filter(Style.buyer_id == buyer_id)
    if category:
        query = query.filter(Style.category.ilike(f"%{category}%"))
    if search:
        s_filter = or_(
            Style.style_no.ilike(f"%{search}%"),
            Style.name.ilike(f"%{search}%"),
            Style.merchant_style_no.ilike(f"%{search}%"),
            Style.pd_merchant_name.ilike(f"%{search}%"),
            Style.prod_merchant_name.ilike(f"%{search}%"),
        )
        query = query.filter(s_filter)
    styles = query.order_by(Style.id.desc()).all()
    return [_to_style(db, s) for s in styles]


@router.post("", response_model=StyleOut, status_code=201)
def create_style(payload: StyleCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    existing = db.query(Style).filter(Style.style_no == payload.style_no).first()
    if existing:
        raise HTTPException(status_code=400, detail="Style number already exists")
    style = Style(**payload.model_dump())
    db.add(style)
    db.commit()
    db.refresh(style)
    return _to_style(db, style)


@router.get("/{style_id}", response_model=StyleOut)
def get_style(style_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    style = db.query(Style).filter(Style.id == style_id).first()
    if not style:
        raise HTTPException(status_code=404, detail="Style not found")
    return _to_style(db, style)


@router.put("/{style_id}", response_model=StyleOut)
def update_style(
    style_id: int,
    payload: StyleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    style = db.query(Style).filter(Style.id == style_id).first()
    if not style:
        raise HTTPException(status_code=404, detail="Style not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(style, key, value)
    db.commit()
    db.refresh(style)
    return _to_style(db, style)


@router.delete("/{style_id}", status_code=204)
def delete_style(style_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    style = db.query(Style).filter(Style.id == style_id).first()
    if not style:
        raise HTTPException(status_code=404, detail="Style not found")
    db.delete(style)
    db.commit()


@router.post("/{style_id}/variants", response_model=StyleVariantOut, status_code=201)
def create_style_variant(
    style_id: int,
    payload: StyleVariantCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    style = db.query(Style).filter(Style.id == style_id).first()
    if not style:
        raise HTTPException(status_code=404, detail="Style not found")

    color = db.query(Color).filter(Color.id == payload.color_id).first()
    size = db.query(Size).filter(Size.id == payload.size_id).first()
    if not color or not size:
        raise HTTPException(status_code=400, detail="Invalid color or size")

    variant_code = f"{style.style_no}-{color.name.upper()}-{size.name.upper()}"
    existing = (
        db.query(StyleVariant)
        .filter(
            StyleVariant.style_id == style_id,
            StyleVariant.color_id == payload.color_id,
            StyleVariant.size_id == payload.size_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Variant already exists")

    variant = StyleVariant(
        style_id=style_id,
        color_id=payload.color_id,
        size_id=payload.size_id,
        variant_code=variant_code,
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return StyleVariantOut(
        id=variant.id,
        style_id=variant.style_id,
        color_id=variant.color_id,
        size_id=variant.size_id,
        variant_code=variant.variant_code,
        style_no=style.style_no,
        color_name=color.name,
        size_name=size.name,
    )