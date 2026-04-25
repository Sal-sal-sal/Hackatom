from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field

from app.core.enums import Priority, Complexity, Status


class SupplierCreate(BaseModel):
    name: str
    location: str
    country: str
    nuclear_certified: bool = False
    rating: float = 0.0
    contact_info: str = ""


class SupplierOut(SupplierCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class SupplyCreate(BaseModel):
    material_name: str
    quantity: float
    unit: str
    supplier_id: int | None = None
    priority: Priority = Priority.MEDIUM
    complexity: Complexity = Complexity.MEDIUM
    status: Status = Status.TODO
    deadline: date
    progress: int = Field(0, ge=0, le=100)
    nuclear_grade_required: bool = False
    note: str = ""


class SupplyUpdate(BaseModel):
    status: Status | None = None
    progress: int | None = Field(None, ge=0, le=100)
    note: str | None = None


class SupplyOut(SupplyCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime


class SupplierMatch(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    rating: float
    nuclear_certified: bool
    location: str
    score: int
