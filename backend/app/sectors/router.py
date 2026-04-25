from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.employ.schemas import BrigadeOut
from app.supplies.schemas import SupplyOut
from app.deadlines.schemas import DeadlineOut
from . import schemas, service

router = APIRouter(prefix="/sectors", tags=["sectors"])


@router.get("", response_model=list[schemas.SectorWithCounts] | list[schemas.SectorOut])
def list_sectors(with_counts: bool = False, db: Session = Depends(get_db)):
    return service.list_sectors(db, with_counts)


@router.get("/{zone_id}/brigades", response_model=list[BrigadeOut])
def list_sector_brigades(zone_id: str, db: Session = Depends(get_db)):
    return service.list_brigades(db, zone_id)


@router.get("/{zone_id}/supplies", response_model=list[SupplyOut])
def list_sector_supplies(zone_id: str, db: Session = Depends(get_db)):
    return service.list_supplies(db, zone_id)


@router.get("/{zone_id}/deadlines", response_model=list[DeadlineOut])
def list_sector_deadlines(zone_id: str, db: Session = Depends(get_db)):
    return service.list_deadlines(db, zone_id)


@router.get("/{zone_id}", response_model=schemas.SectorOut)
def get_sector(zone_id: str, db: Session = Depends(get_db)):
    return service.get_by_zone(db, zone_id)
