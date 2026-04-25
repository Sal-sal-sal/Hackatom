from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.ai_matcher import similarity_score
from app.core.enums import CandidateSource
from . import models, schemas
from .providers import ExternalCandidate, get_provider


def list_brigades(db: Session) -> list[models.Brigade]:
    return db.query(models.Brigade).all()


def create_brigade(db: Session, data: schemas.BrigadeCreate) -> models.Brigade:
    obj = models.Brigade(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj


def get_brigade(db: Session, brigade_id: int) -> models.Brigade:
    obj = db.get(models.Brigade, brigade_id)
    if not obj:
        raise HTTPException(404, "Brigade not found")
    return obj


def list_employees(db: Session, brigade_id: int | None = None, position: str | None = None):
    q = db.query(models.Employee)
    if brigade_id is not None:
        q = q.filter(models.Employee.brigade_id == brigade_id)
    if position:
        q = q.filter(models.Employee.position.ilike(f"%{position}%"))
    return q.all()


def create_employee(db: Session, data: schemas.EmployeeCreate) -> models.Employee:
    obj = models.Employee(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj


def list_vacancies(db: Session) -> list[models.Vacancy]:
    return db.query(models.Vacancy).all()


def create_vacancy(db: Session, data: schemas.VacancyCreate) -> models.Vacancy:
    obj = models.Vacancy(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj


def _from_local_employees(db: Session) -> list[ExternalCandidate]:
    out = []
    for e in db.query(models.Employee).all():
        out.append(ExternalCandidate(
            full_name=e.full_name,
            position=e.position,
            skills=list(e.skills or []),
            past_projects=list(e.past_projects or []),
            experience_years=e.experience_years or 0,
            source_id=str(e.id),
        ))
    return out


async def search_candidates(db: Session, vacancy_id: int,
                            source: CandidateSource) -> list[schemas.CandidateMatch]:
    vacancy = db.get(models.Vacancy, vacancy_id)
    if not vacancy:
        raise HTTPException(404, "Vacancy not found")
    requirements = {"required_skills": vacancy.required_skills or [], "min_experience": 3}

    if source == CandidateSource.MANUAL:
        raw = _from_local_employees(db)
    else:
        provider = get_provider(source)
        if provider is None:
            raise HTTPException(501, f"Provider for source={source} is not configured")
        keywords = [vacancy.role, *(vacancy.required_skills or [])]
        raw = await provider.search(keywords, limit=10)

    matches = []
    for c in raw:
        score = similarity_score(c.model_dump(), requirements)
        matches.append(schemas.CandidateMatch(
            **c.model_dump(), source=source, match_score=score,
        ))
    matches.sort(key=lambda m: m.match_score, reverse=True)
    return matches


def shortlist_candidate(db: Session, vacancy_id: int, employee_id: int) -> models.Employee:
    vacancy = db.get(models.Vacancy, vacancy_id)
    emp = db.get(models.Employee, employee_id)
    if not vacancy or not emp:
        raise HTTPException(404, "Vacancy or Employee not found")
    return emp
