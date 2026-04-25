from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.enums import Priority, Complexity, Status
from . import models, schemas


def list_supplies(db: Session, status: Status | None = None,
                  priority: Priority | None = None,
                  complexity: Complexity | None = None):
    q = db.query(models.Supply)
    if status: q = q.filter(models.Supply.status == status)
    if priority: q = q.filter(models.Supply.priority == priority)
    if complexity: q = q.filter(models.Supply.complexity == complexity)
    return q.all()


def create_supply(db: Session, data: schemas.SupplyCreate) -> models.Supply:
    obj = models.Supply(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj


def get_supply(db: Session, supply_id: int) -> models.Supply:
    obj = db.get(models.Supply, supply_id)
    if not obj:
        raise HTTPException(404, "Supply not found")
    return obj


def update_supply(db: Session, supply_id: int, data: schemas.SupplyUpdate) -> models.Supply:
    obj = get_supply(db, supply_id)
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(obj, key, val)
    db.commit(); db.refresh(obj)
    return obj


def delete_supply(db: Session, supply_id: int) -> None:
    obj = get_supply(db, supply_id)
    db.delete(obj); db.commit()


def list_suppliers(db: Session) -> list[models.Supplier]:
    return db.query(models.Supplier).all()


def _score_supplier(supplier: models.Supplier, supply: models.Supply) -> int:
    """Rank suppliers by rating, certification, and locality."""
    score = int(supplier.rating * 10)
    if supply.nuclear_grade_required and supplier.nuclear_certified:
        score += 40
    elif supply.nuclear_grade_required and not supplier.nuclear_certified:
        score -= 30
    if supplier.country.lower() in ("kazakhstan", "казахстан"):
        score += 15
    return max(0, min(100, score))


def find_suppliers(db: Session, supply_id: int) -> list[schemas.SupplierMatch]:
    supply = get_supply(db, supply_id)
    suppliers = db.query(models.Supplier).all()
    matches = []
    for s in suppliers:
        score = _score_supplier(s, supply)
        matches.append(schemas.SupplierMatch(
            id=s.id, name=s.name, rating=s.rating,
            nuclear_certified=s.nuclear_certified, location=s.location, score=score,
        ))
    matches.sort(key=lambda m: m.score, reverse=True)
    return matches


def assign_supplier(db: Session, supply_id: int, supplier_id: int) -> models.Supply:
    supply = get_supply(db, supply_id)
    supplier = db.get(models.Supplier, supplier_id)
    if not supplier:
        raise HTTPException(404, "Supplier not found")
    supply.supplier_id = supplier.id
    db.commit(); db.refresh(supply)
    return supply
