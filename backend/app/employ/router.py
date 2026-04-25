from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from . import schemas, service

router = APIRouter(prefix="/employ", tags=["employ"])


@router.get("/brigades", response_model=list[schemas.BrigadeOut])
def list_brigades(db: Session = Depends(get_db)):
    return service.list_brigades(db)


@router.post("/brigades", response_model=schemas.BrigadeOut, status_code=201)
def create_brigade(data: schemas.BrigadeCreate, db: Session = Depends(get_db)):
    return service.create_brigade(db, data)


@router.get("/brigades/{brigade_id}", response_model=schemas.BrigadeDetail)
def get_brigade(brigade_id: int, db: Session = Depends(get_db)):
    return service.get_brigade(db, brigade_id)


@router.get("/employees", response_model=list[schemas.EmployeeOut])
def list_employees(brigade_id: int | None = None, position: str | None = None,
                   db: Session = Depends(get_db)):
    return service.list_employees(db, brigade_id, position)


@router.post("/employees", response_model=schemas.EmployeeOut, status_code=201)
def create_employee(data: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    return service.create_employee(db, data)


@router.get("/vacancies", response_model=list[schemas.VacancyOut])
def list_vacancies(db: Session = Depends(get_db)):
    return service.list_vacancies(db)


@router.post("/vacancies", response_model=schemas.VacancyOut, status_code=201)
def create_vacancy(data: schemas.VacancyCreate, db: Session = Depends(get_db)):
    return service.create_vacancy(db, data)


@router.post("/vacancies/{vacancy_id}/search-candidates",
             response_model=list[schemas.CandidateMatch])
async def search_candidates(vacancy_id: int, body: schemas.CandidateSearch,
                            db: Session = Depends(get_db)):
    return await service.search_candidates(db, vacancy_id, body.source)


@router.post("/vacancies/{vacancy_id}/shortlist/{employee_id}",
             response_model=schemas.EmployeeOut)
def shortlist(vacancy_id: int, employee_id: int, db: Session = Depends(get_db)):
    return service.shortlist_candidate(db, vacancy_id, employee_id)
