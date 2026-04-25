from datetime import datetime
from typing import Literal
from pydantic import BaseModel


class GanttItem(BaseModel):
    id: int
    name: str
    start_date: str   # ISO date
    end_date: str     # ISO date
    progress: int
    category: Literal["foundation", "electrical", "structural", "safety"]


class GanttResponse(BaseModel):
    chart_start: str  # ISO date of the earliest start
    chart_end: str    # ISO date of the latest end
    items: list[GanttItem]


class AlertItem(BaseModel):
    id: int
    title: str
    description: str
    severity: Literal["critical", "warning"]
    timestamp: datetime


class ActivityItem(BaseModel):
    id: str
    action: str
    target: str
    user: str
    timestamp: datetime
