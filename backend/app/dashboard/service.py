from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session

from app.core.enums import Priority, Status, DeadlineType
from app.deadlines.models import Deadline
from app.supplies.models import Supply
from app.employ.models import Employee
from . import schemas

PROJECT_START = date(2026, 4, 1)
_CATEGORY_BY_TYPE = {
    DeadlineType.SUPPLY: "structural",
    DeadlineType.HR: "electrical",
    DeadlineType.GENERAL: "foundation",
}


def gantt(db: Session) -> list[schemas.GanttItem]:
    items = db.query(Deadline).order_by(Deadline.deadline_date.asc()).all()
    out = []
    for d in items:
        start = (d.created_at.date() - PROJECT_START).days
        duration = max((d.deadline_date - d.created_at.date()).days, 1)
        category = _CATEGORY_BY_TYPE.get(d.type, "foundation")
        if "safety" in d.title.lower() or "shield" in d.title.lower():
            category = "safety"
        out.append(schemas.GanttItem(
            id=d.id, name=d.title, start_day=max(start, 0),
            duration=duration, progress=d.progress, category=category,
        ))
    return out


def alerts(db: Session) -> list[schemas.AlertItem]:
    today = date.today()
    horizon = today + timedelta(days=7)
    rows = (db.query(Deadline)
            .filter(Deadline.status != Status.DONE)
            .order_by(Deadline.deadline_date.asc())
            .all())
    out = []
    for d in rows:
        if d.deadline_date < today:
            severity = "critical"
        elif d.priority == Priority.HIGH and d.deadline_date <= horizon:
            severity = "warning"
        else:
            continue
        out.append(schemas.AlertItem(
            id=d.id, title=d.title,
            description=d.description or f"Deadline {d.deadline_date.isoformat()}",
            severity=severity, timestamp=d.created_at,
        ))
    return out


def activities(db: Session, limit: int = 10) -> list[schemas.ActivityItem]:
    out: list[schemas.ActivityItem] = []
    for d in db.query(Deadline).order_by(Deadline.created_at.desc()).limit(limit).all():
        out.append(schemas.ActivityItem(
            id=f"d-{d.id}", action="Created task", target=d.title,
            user="Project Manager", timestamp=d.created_at,
        ))
    for s in db.query(Supply).order_by(Supply.updated_at.desc()).limit(limit).all():
        action = "Updated progress" if s.progress > 0 else "Created supply"
        out.append(schemas.ActivityItem(
            id=f"s-{s.id}", action=action, target=s.material_name,
            user="Supply Manager", timestamp=s.updated_at,
        ))
    for e in db.query(Employee).order_by(Employee.created_at.desc()).limit(limit).all():
        out.append(schemas.ActivityItem(
            id=f"e-{e.id}", action="Added candidate", target=e.full_name,
            user="HR Manager", timestamp=e.created_at,
        ))
    out.sort(key=lambda a: a.timestamp, reverse=True)
    return out[:limit]
