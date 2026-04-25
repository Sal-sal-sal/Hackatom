from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Sector(Base):
    __tablename__ = "sectors"

    id: Mapped[int] = mapped_column(primary_key=True)
    zone_id: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(120))
    color: Mapped[str] = mapped_column(String(20), default="#64748b")
    status: Mapped[str] = mapped_column(String(20), default="unknown")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    description: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    brigades: Mapped[list["Brigade"]] = relationship(  # type: ignore[name-defined]
        "Brigade", back_populates="current_sector"
    )
    supplies: Mapped[list["Supply"]] = relationship(  # type: ignore[name-defined]
        "Supply", back_populates="sector"
    )
    deadlines: Mapped[list["Deadline"]] = relationship(  # type: ignore[name-defined]
        "Deadline", back_populates="sector"
    )
