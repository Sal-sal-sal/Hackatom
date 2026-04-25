from datetime import datetime
from typing import Literal
from pydantic import BaseModel


class GanttItem(BaseModel):
    id: int
    name: str
    start_day: int
    duration: int
    progress: int
    category: Literal["foundation", "electrical", "structural", "safety"]


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
