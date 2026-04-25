from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.employ.models import Brigade
from app.supplies.models import Supply
from app.deadlines.models import Deadline
from . import models, schemas


def list_sectors(db: Session, with_counts: bool = False):
    sectors = db.query(models.Sector).order_by(models.Sector.id.asc()).all()
    if not with_counts:
        return sectors
    out = []
    for s in sectors:
        out.append(schemas.SectorWithCounts(
            id=s.id, zone_id=s.zone_id, title=s.title, color=s.color,
            status=s.status, progress=s.progress, description=s.description,
            created_at=s.created_at,
            brigades_count=db.query(Brigade).filter(Brigade.current_sector_id == s.id).count(),
            supplies_count=db.query(Supply).filter(Supply.sector_id == s.id).count(),
            deadlines_count=db.query(Deadline).filter(Deadline.sector_id == s.id).count(),
        ))
    return out


def get_by_zone(db: Session, zone_id: str) -> models.Sector:
    obj = db.query(models.Sector).filter(models.Sector.zone_id == zone_id).first()
    if not obj:
        raise HTTPException(404, f"Sector '{zone_id}' not found")
    return obj


def list_brigades(db: Session, zone_id: str):
    sector = get_by_zone(db, zone_id)
    return db.query(Brigade).filter(Brigade.current_sector_id == sector.id).all()


def list_supplies(db: Session, zone_id: str):
    sector = get_by_zone(db, zone_id)
    return db.query(Supply).filter(Supply.sector_id == sector.id).all()


def list_deadlines(db: Session, zone_id: str):
    sector = get_by_zone(db, zone_id)
    return db.query(Deadline).filter(Deadline.sector_id == sector.id).all()
