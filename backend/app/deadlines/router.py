from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.enums import Priority, Status, DeadlineType
from app.database import get_db
from . import schemas, service

router = APIRouter(prefix="/deadlines", tags=["deadlines"])


@router.get("", response_model=list[schemas.DeadlineOut])
def list_deadlines(status: Status | None = None, priority: Priority | None = None,
                   type: DeadlineType | None = None, overdue: bool | None = None,
                   sector_id: int | None = None, brigade_id: int | None = None,
                   db: Session = Depends(get_db)):
    return service.list_deadlines(db, status, priority, type, overdue, sector_id, brigade_id)


@router.post("", response_model=schemas.DeadlineOut, status_code=201)
def create_deadline(data: schemas.DeadlineCreate, db: Session = Depends(get_db)):
    return service.create_deadline(db, data)


@router.get("/dashboard", response_model=schemas.DashboardKPI)
def dashboard(db: Session = Depends(get_db)):
    return service.dashboard(db)


@router.get("/kanban", response_model=schemas.KanbanBoard)
def kanban(db: Session = Depends(get_db)):
    return service.kanban(db)


@router.get("/alerts", response_model=list[schemas.DeadlineOut])
def alerts(db: Session = Depends(get_db)):
    return service.alerts(db)


@router.patch("/{deadline_id}", response_model=schemas.DeadlineOut)
def update_deadline(deadline_id: int, data: schemas.DeadlineUpdate, db: Session = Depends(get_db)):
    return service.update_deadline(db, deadline_id, data)


@router.delete("/{deadline_id}", status_code=204)
def delete_deadline(deadline_id: int, db: Session = Depends(get_db)):
    service.delete_deadline(db, deadline_id)
