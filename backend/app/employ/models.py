from datetime import datetime, date
from sqlalchemy import String, Integer, JSON, ForeignKey, DateTime, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.core.enums import Priority, Complexity, Status, CandidateSource


class Brigade(Base):
    __tablename__ = "brigades"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    leader_name: Mapped[str] = mapped_column(String(120))
    members_count: Mapped[int] = mapped_column(Integer, default=0)
    specialization: Mapped[str] = mapped_column(String(120))
    current_sector_id: Mapped[int | None] = mapped_column(
        ForeignKey("sectors.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    employees: Mapped[list["Employee"]] = relationship(back_populates="brigade")
    current_sector = relationship("Sector", back_populates="brigades")


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(160))
    position: Mapped[str] = mapped_column(String(120))
    experience_years: Mapped[int] = mapped_column(Integer, default=0)
    skills: Mapped[list] = mapped_column(JSON, default=list)
    past_projects: Mapped[list] = mapped_column(JSON, default=list)
    source: Mapped[CandidateSource] = mapped_column(String(20), default=CandidateSource.MANUAL)
    brigade_id: Mapped[int | None] = mapped_column(ForeignKey("brigades.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    brigade: Mapped[Brigade | None] = relationship(back_populates="employees")


class Vacancy(Base):
    __tablename__ = "vacancies"

    id: Mapped[int] = mapped_column(primary_key=True)
    role: Mapped[str] = mapped_column(String(120))
    required_skills: Mapped[list] = mapped_column(JSON, default=list)
    priority: Mapped[Priority] = mapped_column(String(20), default=Priority.MEDIUM)
    complexity: Mapped[Complexity] = mapped_column(String(20), default=Complexity.MEDIUM)
    hire_by_date: Mapped[date] = mapped_column(Date)
    status: Mapped[Status] = mapped_column(String(20), default=Status.TODO)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
