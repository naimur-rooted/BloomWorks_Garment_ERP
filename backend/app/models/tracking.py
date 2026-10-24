from datetime import datetime
from enum import Enum
from sqlalchemy import String, Integer, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, TimestampMixin


class BundleStage(str, Enum):
    CUTTING = "CUTTING"
    WASHING = "WASHING"
    SEWING_IN = "SEWING_IN"
    SEWING_OUT_QC = "SEWING_OUT_QC"
    FINISHING = "FINISHING"
    PACKED = "PACKED"


class BundleStatus(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    HELD = "HELD"


class Bundle(TimestampMixin, Base):
    __tablename__ = "bundles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    bundle_code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    order_number: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    style_code: Mapped[str] = mapped_column(String(100), nullable=False)
    color_name: Mapped[str] = mapped_column(String(100), nullable=False)
    size_code: Mapped[str] = mapped_column(String(50), nullable=False)
    cut_number: Mapped[str] = mapped_column(String(100), nullable=False)
    bundle_seq: Mapped[int] = mapped_column(Integer, nullable=False)
    total_bundles: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    ply_start: Mapped[int] = mapped_column(Integer, nullable=False)
    ply_end: Mapped[int] = mapped_column(Integer, nullable=False)
    current_stage: Mapped[str] = mapped_column(String(50), nullable=False, default=BundleStage.CUTTING.value, index=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default=BundleStatus.IN_PROGRESS.value)
    defect_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    history_json: Mapped[str | None] = mapped_column(Text)
