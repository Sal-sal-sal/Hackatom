from datetime import datetime, date
from sqlalchemy import String, Integer, Float, Boolean, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.core.enums import Priority, Complexity, Status


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    location: Mapped[str] = mapped_column(String(120))
    country: Mapped[str] = mapped_column(String(60))
    nuclear_certified: Mapped[bool] = mapped_column(Boolean, default=False)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    contact_info: Mapped[str] = mapped_column(String(200), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    supplies: Mapped[list["Supply"]] = relationship(back_populates="supplier")


class Supply(Base):
    __tablename__ = "supplies"

    id: Mapped[int] = mapped_column(primary_key=True)
    material_name: Mapped[str] = mapped_column(String(160))
    quantity: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(20))
    supplier_id: Mapped[int | None] = mapped_column(ForeignKey("suppliers.id"), nullable=True)
    priority: Mapped[Priority] = mapped_column(String(20), default=Priority.MEDIUM)
    complexity: Mapped[Complexity] = mapped_column(String(20), default=Complexity.MEDIUM)
    status: Mapped[Status] = mapped_column(String(20), default=Status.TODO)
    deadline: Mapped[date] = mapped_column(Date)
    progress: Mapped[int] = mapped_column(Integer, default=0)
    nuclear_grade_required: Mapped[bool] = mapped_column(Boolean, default=False)
    note: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow,
                                                 onupdate=datetime.utcnow)

    supplier: Mapped[Supplier | None] = relationship(back_populates="supplies")
