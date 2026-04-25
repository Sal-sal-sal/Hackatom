from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.ai_matcher import similarity_score
from app.core.enums import CandidateSource
from . import models, schemas


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


def _mock_candidates(source: CandidateSource) -> list[dict]:
    pool = [
        {"full_name": "Сейткали Б.", "position": "Инженер-строитель", "experience_years": 8,
         "skills": ["concrete", "rebar", "blueprints"],
         "past_projects": ["Темиртау NPP feasibility", "Astana metro"], "source": source},
        {"full_name": "Досмухамедов А.", "position": "Электромонтажник", "experience_years": 5,
         "skills": ["electrical", "wiring", "safety"],
         "past_projects": ["Almaty substation"], "source": source},
        {"full_name": "Иванов С.", "position": "Сварщик 6 разряда", "experience_years": 12,
         "skills": ["welding", "nuclear-grade", "inspection"],
         "past_projects": ["Rosatom NPP Akkuyu", "Reactor vessel weld"], "source": source},
        {"full_name": "Нурланов К.", "position": "Прораб", "experience_years": 15,
         "skills": ["management", "scheduling", "safety", "construction"],
         "past_projects": ["АЭС подготовка площадки", "Karaganda HPP"], "source": source},
    ]
    return pool


def search_candidates(db: Session, vacancy_id: int, source: CandidateSource) -> list[schemas.CandidateMatch]:
    vacancy = db.get(models.Vacancy, vacancy_id)
    if not vacancy:
        raise HTTPException(404, "Vacancy not found")
    requirements = {"required_skills": vacancy.required_skills, "min_experience": 3}
    results = []
    for cand in _mock_candidates(source):
        score = similarity_score(cand, requirements)
        results.append(schemas.CandidateMatch(**cand, match_score=score))
    results.sort(key=lambda c: c.match_score, reverse=True)
    return results


def shortlist_candidate(db: Session, vacancy_id: int, employee_id: int) -> models.Employee:
    vacancy = db.get(models.Vacancy, vacancy_id)
    emp = db.get(models.Employee, employee_id)
    if not vacancy or not emp:
        raise HTTPException(404, "Vacancy or Employee not found")
    return emp
