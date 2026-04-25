"""Seed sectors from frontend/public/models/npp/npp-main.zones.json."""
import json
from pathlib import Path
from sqlalchemy.orm import Session

from app.employ.models import Brigade
from app.supplies.models import Supply
from app.deadlines.models import Deadline
from . import models

_FALLBACK = [
    {"zoneId": "reactor-unit", "title": "Реакторный блок", "color": "#ef4444",
     "status": "critical", "progress": 54, "description": ""},
    {"zoneId": "turbine-hall", "title": "Турбинный зал", "color": "#f97316",
     "status": "warning", "progress": 67, "description": ""},
    {"zoneId": "cooling-systems", "title": "Системы охлаждения", "color": "#06b6d4",
     "status": "warning", "progress": 61, "description": ""},
    {"zoneId": "switchyard-grid", "title": "ОРУ и электросети", "color": "#22c55e",
     "status": "ok", "progress": 79, "description": ""},
    {"zoneId": "auxiliary-buildings", "title": "Вспомогательные здания",
     "color": "#a855f7", "status": "unknown", "progress": 40, "description": ""},
    {"zoneId": "construction-zone", "title": "Стройплощадка",
     "color": "#facc15", "status": "warning", "progress": 35, "description": ""},
]


def _load_zones() -> list[dict]:
    project_root = Path(__file__).resolve().parents[3]
    path = project_root / "frontend" / "public" / "models" / "npp" / "npp-main.zones.json"
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return _FALLBACK


def seed_sectors(db: Session) -> dict[str, int]:
    """Idempotent upsert by zone_id. Returns {zone_id: sector.id}."""
    zones = _load_zones()
    existing = {s.zone_id: s for s in db.query(models.Sector).all()}
    for z in zones:
        zid = z.get("zoneId") or z.get("zone_id")
        if not zid:
            continue
        if zid in existing:
            continue
        db.add(models.Sector(
            zone_id=zid, title=z.get("title", zid),
            color=z.get("color", "#64748b"),
            status=z.get("status", "unknown"),
            progress=int(z.get("progress", 0) or 0),
            description=z.get("description", "") or "",
        ))
    db.flush()
    return {s.zone_id: s.id for s in db.query(models.Sector).all()}


_BRIGADE_BY_SPEC = {
    "Монтаж конструкций": "reactor-unit",
    "Бетонные работы": "cooling-systems",
    "Электромонтаж": "switchyard-grid",
}

_SUPPLY_BY_KEYWORD = [
    ("Арматура", "reactor-unit"),
    ("Бетон", "reactor-unit"),
    ("Кабель", "switchyard-grid"),
    ("Корпус реактора", "reactor-unit"),
    ("электрод", "reactor-unit"),
    ("Песок", "cooling-systems"),
]

_DEADLINE_BY_KEYWORD = [
    ("котлован", "reactor-unit"),
    ("арматур", "reactor-unit"),
    ("сварщик", "reactor-unit"),
    ("бетон", "reactor-unit"),
]


def assign_initial_sectors(db: Session, zone_to_id: dict[str, int]) -> None:
    """Set current_sector_id / sector_id on existing rows that have NULL."""
    for b in db.query(Brigade).filter(Brigade.current_sector_id.is_(None)).all():
        zone = _BRIGADE_BY_SPEC.get(b.specialization)
        if zone and zone in zone_to_id:
            b.current_sector_id = zone_to_id[zone]
    for s in db.query(Supply).filter(Supply.sector_id.is_(None)).all():
        for kw, zone in _SUPPLY_BY_KEYWORD:
            if kw.lower() in s.material_name.lower() and zone in zone_to_id:
                s.sector_id = zone_to_id[zone]
                break
    for d in db.query(Deadline).filter(Deadline.sector_id.is_(None)).all():
        for kw, zone in _DEADLINE_BY_KEYWORD:
            if kw.lower() in d.title.lower() and zone in zone_to_id:
                d.sector_id = zone_to_id[zone]
                break
