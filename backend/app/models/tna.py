from datetime import date
from enum import Enum
from sqlalchemy import String, Date, Integer, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class TNAStatus(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    ON_TRACK = "On Track"
    COMPLETED = "Completed"
    OVERDUE = "Overdue"


class TNAPlan(TimestampMixin, Base):
    __tablename__ = "tna_plans"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("buyer_orders.id"), nullable=False)
    plan_name: Mapped[str] = mapped_column(String(255), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    order: Mapped["BuyerOrder"] = relationship()
    milestones: Mapped[list["TNAMilestone"]] = relationship(back_populates="plan", cascade="all, delete-orphan")


class TNAMilestone(TimestampMixin, Base):
    __tablename__ = "tna_milestones"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tna_plan_id: Mapped[int] = mapped_column(ForeignKey("tna_plans.id"), nullable=False)
    milestone_name: Mapped[str] = mapped_column(String(255), nullable=False)
    planned_date: Mapped[date] = mapped_column(Date, nullable=False)
    actual_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[TNAStatus] = mapped_column(SAEnum(TNAStatus, name="tna_status", native_enum=False), nullable=False, default=TNAStatus.PENDING)
    responsible_person: Mapped[str | None] = mapped_column(String(255))
    remarks: Mapped[str | None] = mapped_column(Text)

    plan: Mapped["TNAPlan"] = relationship(back_populates="milestones")