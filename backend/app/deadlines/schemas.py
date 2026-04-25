from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field

from app.core.enums import Priority, Complexity, Status, DeadlineType


class DeadlineCreate(BaseModel):
    title: str
    description: str = ""
    type: DeadlineType = DeadlineType.GENERAL
    priority: Priority = Priority.MEDIUM
    complexity: Complexity = Complexity.MEDIUM
    status: Status = Status.TODO
    deadline_date: date
    progress: int = Field(0, ge=0, le=100)
    related_id: int | None = None


class DeadlineUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: Status | None = None
    progress: int | None = Field(None, ge=0, le=100)
    deadline_date: date | None = None
    priority: Priority | None = None


class DeadlineOut(DeadlineCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class DashboardKPI(BaseModel):
    total: int
    completed: int
    in_progress: int
    overdue: int
    upcoming_7days: int


class KanbanBoard(BaseModel):
    todo: list[DeadlineOut]
    in_progress: list[DeadlineOut]
    done: list[DeadlineOut]
