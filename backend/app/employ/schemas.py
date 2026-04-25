from datetime import date, datetime
from pydantic import BaseModel, ConfigDict

from app.core.enums import Priority, Complexity, Status, CandidateSource


class BrigadeCreate(BaseModel):
    name: str
    leader_name: str
    members_count: int = 0
    specialization: str


class BrigadeOut(BrigadeCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class EmployeeCreate(BaseModel):
    full_name: str
    position: str
    experience_years: int = 0
    skills: list[str] = []
    past_projects: list[str] = []
    source: CandidateSource = CandidateSource.MANUAL
    brigade_id: int | None = None


class EmployeeOut(EmployeeCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class BrigadeDetail(BrigadeOut):
    employees: list[EmployeeOut] = []


class VacancyCreate(BaseModel):
    role: str
    required_skills: list[str] = []
    priority: Priority = Priority.MEDIUM
    complexity: Complexity = Complexity.MEDIUM
    hire_by_date: date
    status: Status = Status.TODO


class VacancyOut(VacancyCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class EmployeeBrigadeUpdate(BaseModel):
    brigade_id: int | None = None


class CandidateSearch(BaseModel):
    source: CandidateSource


class CandidateMatch(BaseModel):
    full_name: str
    position: str
    experience_years: int = 0
    skills: list[str] = []
    past_projects: list[str] = []
    source: CandidateSource
    match_score: int
    url: str | None = None
    employer: str | None = None
    location: str | None = None
    salary: str | None = None
    source_id: str | None = None
    telegram: str | None = None
