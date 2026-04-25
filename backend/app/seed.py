"""Initial mock data for HackAtom demo (Kazakhstan NPP context)."""
from datetime import date, timedelta
from sqlalchemy.orm import Session

from app.core.enums import Priority, Complexity, Status, DeadlineType, CandidateSource
from app.employ import models as em
from app.supplies import models as sm
from app.deadlines import models as dm


class DatabaseSeeder:
    def __init__(self, db: Session):
        self.db = db

    def already_seeded(self) -> bool:
        return self.db.query(em.Brigade).count() > 0

    def run(self) -> None:
        if self.already_seeded():
            return
        self._brigades_and_employees()
        self._vacancies()
        self._suppliers_and_supplies()
        self._deadlines()
        self.db.commit()

    def _brigades_and_employees(self):
        brigades = [
            em.Brigade(name="Алматинская монтажная", leader_name="Сейткали Б.",
                       members_count=12, specialization="Монтаж конструкций"),
            em.Brigade(name="Темиртау Бетон", leader_name="Иванов С.",
                       members_count=8, specialization="Бетонные работы"),
            em.Brigade(name="Астана Электро", leader_name="Нурланов К.",
                       members_count=6, specialization="Электромонтаж"),
        ]
        self.db.add_all(brigades); self.db.flush()
        employees = [
            em.Employee(full_name="Досмухамедов А.", position="Сварщик",
                        experience_years=7, skills=["welding", "nuclear-grade"],
                        past_projects=["Akkuyu NPP"], source=CandidateSource.MANUAL,
                        brigade_id=brigades[0].id),
            em.Employee(full_name="Иванов С.", position="Бригадир",
                        experience_years=15, skills=["management", "construction"],
                        past_projects=["АЭС подготовка"], brigade_id=brigades[1].id),
            em.Employee(full_name="Нурланов К.", position="Электрик",
                        experience_years=10, skills=["electrical", "safety"],
                        past_projects=["Almaty substation"], brigade_id=brigades[2].id),
            em.Employee(full_name="Петров В.", position="Инженер ПТО",
                        experience_years=6, skills=["blueprints", "scheduling"],
                        past_projects=["Astana metro"], brigade_id=brigades[0].id),
            em.Employee(full_name="Алиев Р.", position="Крановщик",
                        experience_years=4, skills=["crane", "rigging"],
                        past_projects=["Karaganda HPP"], brigade_id=brigades[1].id),
        ]
        self.db.add_all(employees)

    def _vacancies(self):
        today = date.today()
        self.db.add_all([
            em.Vacancy(role="Сварщик 6 разряда",
                       required_skills=["welding", "nuclear-grade", "inspection"],
                       priority=Priority.HIGH, complexity=Complexity.HARD,
                       hire_by_date=today + timedelta(days=30)),
            em.Vacancy(role="Прораб монтажных работ",
                       required_skills=["management", "scheduling", "construction"],
                       priority=Priority.HIGH, complexity=Complexity.MEDIUM,
                       hire_by_date=today + timedelta(days=45)),
            em.Vacancy(role="Электромонтажник",
                       required_skills=["electrical", "wiring", "safety"],
                       priority=Priority.MEDIUM, complexity=Complexity.MEDIUM,
                       hire_by_date=today + timedelta(days=60)),
        ])

    def _suppliers_and_supplies(self):
        suppliers = [
            sm.Supplier(name="КазСтальПром", location="Темиртау", country="Казахстан",
                        nuclear_certified=True, rating=4.7,
                        contact_info="sales@kazstal.kz"),
            sm.Supplier(name="AlmatyBeton", location="Алматы", country="Казахстан",
                        nuclear_certified=False, rating=4.3,
                        contact_info="info@almatybeton.kz"),
            sm.Supplier(name="КазКабель", location="Астана", country="Казахстан",
                        nuclear_certified=True, rating=4.5,
                        contact_info="trade@kazkabel.kz"),
            sm.Supplier(name="Rosatom Supply", location="Москва", country="Россия",
                        nuclear_certified=True, rating=4.9,
                        contact_info="b2b@rosatom.ru"),
        ]
        self.db.add_all(suppliers); self.db.flush()
        today = date.today()
        self.db.add_all([
            sm.Supply(material_name="Арматура А500", quantity=150, unit="т",
                      supplier_id=suppliers[0].id, priority=Priority.HIGH,
                      complexity=Complexity.MEDIUM, status=Status.IN_PROGRESS,
                      deadline=today + timedelta(days=20), progress=45),
            sm.Supply(material_name="Бетон М500", quantity=2000, unit="м³",
                      supplier_id=suppliers[1].id, priority=Priority.HIGH,
                      complexity=Complexity.SIMPLE, status=Status.TODO,
                      deadline=today + timedelta(days=10), progress=0),
            sm.Supply(material_name="Кабель силовой ВВГнг", quantity=8000, unit="м",
                      supplier_id=suppliers[2].id, priority=Priority.MEDIUM,
                      complexity=Complexity.SIMPLE, status=Status.IN_PROGRESS,
                      deadline=today + timedelta(days=35), progress=70),
            sm.Supply(material_name="Корпус реактора (узлы)", quantity=4, unit="шт",
                      supplier_id=suppliers[3].id, priority=Priority.HIGH,
                      complexity=Complexity.HARD, status=Status.TODO,
                      deadline=today + timedelta(days=120), progress=5,
                      nuclear_grade_required=True),
            sm.Supply(material_name="Сварочные электроды НИАТ-5", quantity=500, unit="кг",
                      priority=Priority.LOW, complexity=Complexity.SIMPLE,
                      status=Status.DONE, deadline=today - timedelta(days=5),
                      progress=100, nuclear_grade_required=True),
            sm.Supply(material_name="Песок строительный", quantity=1200, unit="т",
                      supplier_id=suppliers[1].id, priority=Priority.LOW,
                      complexity=Complexity.SIMPLE, status=Status.DONE,
                      deadline=today - timedelta(days=15), progress=100),
        ])

    def _deadlines(self):
        today = date.today()
        self.db.add_all([
            dm.Deadline(title="Подготовка котлована", type=DeadlineType.GENERAL,
                        priority=Priority.HIGH, status=Status.IN_PROGRESS,
                        deadline_date=today + timedelta(days=14), progress=60),
            dm.Deadline(title="Поставка арматуры А500", type=DeadlineType.SUPPLY,
                        priority=Priority.HIGH, status=Status.IN_PROGRESS,
                        deadline_date=today + timedelta(days=20), progress=45),
            dm.Deadline(title="Найм сварщика 6 разряда", type=DeadlineType.HR,
                        priority=Priority.HIGH, status=Status.TODO,
                        deadline_date=today + timedelta(days=30), progress=10),
            dm.Deadline(title="Получение лицензии Ростехнадзора", type=DeadlineType.GENERAL,
                        priority=Priority.HIGH, complexity=Complexity.HARD,
                        status=Status.IN_PROGRESS,
                        deadline_date=today + timedelta(days=90), progress=30),
            dm.Deadline(title="Закрытие старого контракта поставщика",
                        type=DeadlineType.SUPPLY, priority=Priority.MEDIUM,
                        status=Status.TODO,
                        deadline_date=today - timedelta(days=3), progress=80),
            dm.Deadline(title="Аттестация бригады монтажников", type=DeadlineType.HR,
                        priority=Priority.MEDIUM, status=Status.DONE,
                        deadline_date=today - timedelta(days=10), progress=100),
            dm.Deadline(title="Согласование 3D-модели площадки",
                        type=DeadlineType.GENERAL, priority=Priority.MEDIUM,
                        status=Status.IN_PROGRESS,
                        deadline_date=today + timedelta(days=5), progress=75),
            dm.Deadline(title="Поставка бетона М500", type=DeadlineType.SUPPLY,
                        priority=Priority.HIGH, status=Status.TODO,
                        deadline_date=today + timedelta(days=10), progress=0),
        ])
