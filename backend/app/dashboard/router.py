from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deadlines import service as deadlines_service
from app.deadlines.schemas import DashboardKPI
from . import schemas, service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/kpi", response_model=DashboardKPI)
def kpi(db: Session = Depends(get_db)):
    return deadlines_service.dashboard(db)


@router.get("/gantt", response_model=list[schemas.GanttItem])
def gantt(db: Session = Depends(get_db)):
    return service.gantt(db)


@router.get("/alerts", response_model=list[schemas.AlertItem])
def alerts(db: Session = Depends(get_db)):
    return service.alerts(db)


@router.get("/activities", response_model=list[schemas.ActivityItem])
def activities(limit: int = 10, db: Session = Depends(get_db)):
    return service.activities(db, limit)
