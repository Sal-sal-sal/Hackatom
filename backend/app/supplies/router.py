from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.enums import Priority, Complexity, Status
from app.database import get_db
from . import schemas, service

router = APIRouter(prefix="/supplies", tags=["supplies"])


@router.get("", response_model=list[schemas.SupplyOut])
def list_supplies(status: Status | None = None, priority: Priority | None = None,
                  complexity: Complexity | None = None, db: Session = Depends(get_db)):
    return service.list_supplies(db, status, priority, complexity)


@router.post("", response_model=schemas.SupplyOut, status_code=201)
def create_supply(data: schemas.SupplyCreate, db: Session = Depends(get_db)):
    return service.create_supply(db, data)


@router.get("/suppliers", response_model=list[schemas.SupplierOut])
def list_suppliers(db: Session = Depends(get_db)):
    return service.list_suppliers(db)


@router.get("/{supply_id}", response_model=schemas.SupplyOut)
def get_supply(supply_id: int, db: Session = Depends(get_db)):
    return service.get_supply(db, supply_id)


@router.patch("/{supply_id}", response_model=schemas.SupplyOut)
def update_supply(supply_id: int, data: schemas.SupplyUpdate, db: Session = Depends(get_db)):
    return service.update_supply(db, supply_id, data)


@router.delete("/{supply_id}", status_code=204)
def delete_supply(supply_id: int, db: Session = Depends(get_db)):
    service.delete_supply(db, supply_id)


@router.post("/{supply_id}/find-supplier", response_model=list[schemas.SupplierMatch])
def find_supplier(supply_id: int, db: Session = Depends(get_db)):
    return service.find_suppliers(db, supply_id)


@router.post("/{supply_id}/assign-supplier/{supplier_id}", response_model=schemas.SupplyOut)
def assign_supplier(supply_id: int, supplier_id: int, db: Session = Depends(get_db)):
    return service.assign_supplier(db, supply_id, supplier_id)
