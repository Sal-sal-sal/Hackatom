from datetime import date, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.enums import Priority, Status, DeadlineType
from . import models, schemas


def list_deadlines(db: Session, status: Status | None = None,
                   priority: Priority | None = None,
                   type: DeadlineType | None = None,
                   overdue: bool | None = None,
                   sector_id: int | None = None,
                   brigade_id: int | None = None) -> list[models.Deadline]:
    q = db.query(models.Deadline)
    if status: q = q.filter(models.Deadline.status == status)
    if priority: q = q.filter(models.Deadline.priority == priority)
    if type: q = q.filter(models.Deadline.type == type)
    if sector_id is not None:
        q = q.filter(models.Deadline.sector_id == sector_id)
    if brigade_id is not None:
        q = q.filter(models.Deadline.brigade_id == brigade_id)
    if overdue is True:
        q = q.filter(models.Deadline.deadline_date < date.today(),
                     models.Deadline.status != Status.DONE)
    elif overdue is False:
        q = q.filter(models.Deadline.deadline_date >= date.today())
    return q.all()


def create_deadline(db: Session, data: schemas.DeadlineCreate) -> models.Deadline:
    obj = models.Deadline(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj


def _get(db: Session, deadline_id: int) -> models.Deadline:
    obj = db.get(models.Deadline, deadline_id)
    if not obj:
        raise HTTPException(404, "Deadline not found")
    return obj


def update_deadline(db: Session, deadline_id: int, data: schemas.DeadlineUpdate) -> models.Deadline:
    obj = _get(db, deadline_id)
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(obj, key, val)
    db.commit(); db.refresh(obj)
    return obj


def delete_deadline(db: Session, deadline_id: int) -> None:
    obj = _get(db, deadline_id)
    db.delete(obj); db.commit()


def dashboard(db: Session) -> schemas.DashboardKPI:
    items = db.query(models.Deadline).all()
    today = date.today()
    horizon = today + timedelta(days=7)
    return schemas.DashboardKPI(
        total=len(items),
        completed=sum(1 for i in items if i.status == Status.DONE),
        in_progress=sum(1 for i in items if i.status == Status.IN_PROGRESS),
        overdue=sum(1 for i in items if i.deadline_date < today and i.status != Status.DONE),
        upcoming_7days=sum(1 for i in items if today <= i.deadline_date <= horizon),
    )


def kanban(db: Session) -> schemas.KanbanBoard:
    items = db.query(models.Deadline).all()
    return schemas.KanbanBoard(
        todo=[i for i in items if i.status == Status.TODO],
        in_progress=[i for i in items if i.status == Status.IN_PROGRESS],
        done=[i for i in items if i.status == Status.DONE],
    )


def alerts(db: Session) -> list[models.Deadline]:
    today = date.today()
    horizon = today + timedelta(days=7)
    return (db.query(models.Deadline)
            .filter(models.Deadline.status != Status.DONE,
                    models.Deadline.deadline_date <= horizon)
            .order_by(models.Deadline.deadline_date.asc())
            .all())
