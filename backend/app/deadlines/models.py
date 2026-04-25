from datetime import datetime, date
from sqlalchemy import String, Integer, DateTime, Date, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.core.enums import Priority, Complexity, Status, DeadlineType


class Deadline(Base):
    __tablename__ = "deadlines"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text, default="")
    type: Mapped[DeadlineType] = mapped_column(String(20), default=DeadlineType.GENERAL)
    priority: Mapped[Priority] = mapped_column(String(20), default=Priority.MEDIUM)
    complexity: Mapped[Complexity] = mapped_column(String(20), default=Complexity.MEDIUM)
    status: Mapped[Status] = mapped_column(String(20), default=Status.TODO)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    deadline_date: Mapped[date] = mapped_column(Date)
    progress: Mapped[int] = mapped_column(Integer, default=0)
    related_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
