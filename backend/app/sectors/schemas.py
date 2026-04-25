from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SectorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    zone_id: str
    title: str
    color: str
    status: str
    progress: int
    description: str
    created_at: datetime


class SectorWithCounts(SectorOut):
    brigades_count: int = 0
    supplies_count: int = 0
    deadlines_count: int = 0


class BrigadeAssign(BaseModel):
    current_sector_id: int | None = None
