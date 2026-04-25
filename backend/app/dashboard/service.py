from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session

from app.core.enums import Priority, Status, DeadlineType
from app.deadlines.models import Deadline
from app.supplies.models import Supply
from app.employ.models import Employee
from . import schemas

_CATEGORY_BY_TYPE = {
    DeadlineType.SUPPLY: "structural",
    DeadlineType.HR: "electrical",
    DeadlineType.GENERAL: "foundation",
}


def gantt(db: Session) -> schemas.GanttResponse:
    items = db.query(Deadline).order_by(Deadline.deadline_date.asc()).all()
    if not items:
        today = date.today()
        return schemas.GanttResponse(
            chart_start=today.isoformat(),
            chart_end=today.isoformat(),
            items=[],
        )

    today = date.today()
    resolved = []
    for d in items:
        s = d.start_date or d.created_at.date()
        e = d.deadline_date
        if e < s:
            e = s + timedelta(days=1)
        resolved.append((d, s, e))

    chart_start = min(s for _, s, _ in resolved)
    chart_end = max(e for _, _, e in resolved)

    out = []
    for d, s, e in resolved:
        category = _CATEGORY_BY_TYPE.get(d.type, "foundation")
        if "safety" in d.title.lower() or "shield" in d.title.lower() or "лицензи" in d.title.lower():
            category = "safety"
        out.append(schemas.GanttItem(
            id=d.id, name=d.title,
            start_date=s.isoformat(),
            end_date=e.isoformat(),
            progress=d.progress,
            category=category,
        ))
    return schemas.GanttResponse(
        chart_start=chart_start.isoformat(),
        chart_end=chart_end.isoformat(),
        items=out,
    )


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
