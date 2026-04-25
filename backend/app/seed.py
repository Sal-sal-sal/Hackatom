"""Initial mock data for HackAtom demo (Kazakhstan NPP context)."""
from datetime import date, timedelta
from sqlalchemy.orm import Session

from app.core.enums import Priority, Complexity, Status, DeadlineType, CandidateSource
from app.employ import models as em
from app.supplies import models as sm
from app.deadlines import models as dm
from app.sectors.seed import seed_sectors, assign_initial_sectors


class DatabaseSeeder:
    def __init__(self, db: Session):
        self.db = db

    def already_seeded(self) -> bool:
        return self.db.query(em.Brigade).count() > 0

    def run(self) -> None:
        zone_to_id = seed_sectors(self.db)
        if self.already_seeded():
            self._bulk_employees()
            assign_initial_sectors(self.db, zone_to_id)
            self.db.commit()
            return
        self._brigades_and_employees()
        self._vacancies()
        self._suppliers_and_supplies()
        self._deadlines()
        self._bulk_employees()
        assign_initial_sectors(self.db, zone_to_id)
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
                        start_date=today - timedelta(days=10),
                        deadline_date=today + timedelta(days=14), progress=60),
            dm.Deadline(title="Поставка арматуры А500", type=DeadlineType.SUPPLY,
                        priority=Priority.HIGH, status=Status.IN_PROGRESS,
                        start_date=today - timedelta(days=5),
                        deadline_date=today + timedelta(days=20), progress=45),
            dm.Deadline(title="Найм сварщика 6 разряда", type=DeadlineType.HR,
                        priority=Priority.HIGH, status=Status.TODO,
                        start_date=today,
                        deadline_date=today + timedelta(days=30), progress=10),
            dm.Deadline(title="Получение лицензии Ростехнадзора", type=DeadlineType.GENERAL,
                        priority=Priority.HIGH, complexity=Complexity.HARD,
                        status=Status.IN_PROGRESS,
                        start_date=today - timedelta(days=20),
                        deadline_date=today + timedelta(days=90), progress=30),
            dm.Deadline(title="Закрытие старого контракта поставщика",
                        type=DeadlineType.SUPPLY, priority=Priority.MEDIUM,
                        status=Status.TODO,
                        start_date=today - timedelta(days=15),
                        deadline_date=today - timedelta(days=3), progress=80),
            dm.Deadline(title="Аттестация бригады монтажников", type=DeadlineType.HR,
                        priority=Priority.MEDIUM, status=Status.DONE,
                        start_date=today - timedelta(days=20),
                        deadline_date=today - timedelta(days=10), progress=100),
            dm.Deadline(title="Согласование 3D-модели площадки",
                        type=DeadlineType.GENERAL, priority=Priority.MEDIUM,
                        status=Status.IN_PROGRESS,
                        start_date=today - timedelta(days=3),
                        deadline_date=today + timedelta(days=5), progress=75),
            dm.Deadline(title="Поставка бетона М500", type=DeadlineType.SUPPLY,
                        priority=Priority.HIGH, status=Status.TODO,
                        start_date=today + timedelta(days=2),
                        deadline_date=today + timedelta(days=10), progress=0),
        ])

    def _bulk_employees(self):
        if self.db.query(em.Employee).count() >= 20:
            return
        brigades = self.db.query(em.Brigade).all()
        bid = [b.id for b in brigades] if brigades else [None]

        _DATA = [
            # (full_name, position, exp, skills, projects, brigade_idx or None)
            ("Абдрахманов Е.Б.", "Сварщик", 9, ["welding","nuclear-grade","TIG"], ["Akkuyu NPP"], 0),
            ("Аймаганов Д.С.", "Сварщик", 6, ["welding","MIG","inspection"], ["Балтийская АЭС"], 0),
            ("Байжанов Р.К.", "Сварщик", 11, ["welding","nuclear-grade","radiography"], ["Аккую"], 1),
            ("Жумабеков А.Т.", "Сварщик", 4, ["welding","MIG","safety"], ["Астана Арена"], 1),
            ("Касымов Н.О.", "Сварщик", 14, ["welding","nuclear-grade","ASME"], ["Белорусская АЭС"], 2),
            ("Кожахметов Т.М.", "Сварщик", 7, ["welding","TIG","inspection"], ["Karaganda HPP"], 2),
            ("Омаров С.В.", "Сварщик", 3, ["welding","MIG"], ["Алматы метро"], None),
            ("Тажибаев Б.Н.", "Сварщик", 8, ["welding","nuclear-grade","NDT"], ["Аккую"], None),
            ("Нурмаганбетов К.А.", "Сварщик", 5, ["welding","safety"], ["Темиртау"], None),
            ("Смагулов И.Д.", "Сварщик", 12, ["welding","nuclear-grade","GTAW"], ["Мангышлак АЭС"], 0),

            ("Сейтжанов А.Б.", "Электромонтажник", 8, ["electrical","wiring","safety"], ["Almaty substation"], 2),
            ("Кенжебаев Г.С.", "Электромонтажник", 5, ["electrical","PLC","wiring"], ["Астана ТЭЦ"], 2),
            ("Тлеубаев Х.К.", "Электромонтажник", 10, ["electrical","nuclear-grade","instrumentation"], ["Аккую"], 2),
            ("Волков М.Р.", "Электромонтажник", 6, ["electrical","wiring","grounding"], ["Карагандинская ТЭЦ"], None),
            ("Соколов Д.А.", "Электромонтажник", 4, ["electrical","safety","wiring"], ["Алматы"], None),
            ("Карменов Б.Т.", "Электромонтажник", 7, ["electrical","instrumentation","PLC"], ["Балхашская ТЭЦ"], 2),
            ("Захаров П.И.", "Электромонтажник", 9, ["electrical","nuclear-grade","relay"], ["Смоленская АЭС"], None),
            ("Новиков А.В.", "Электромонтажник", 3, ["electrical","wiring"], ["Нур-Султан ТЭЦ"], None),

            ("Дюсенов М.К.", "Бетонщик", 6, ["concrete","formwork","QC"], ["Akkuyu NPP"], 1),
            ("Есенов Т.Б.", "Бетонщик", 4, ["concrete","vibration","safety"], ["Астана"], 1),
            ("Мамытбеков С.Н.", "Бетонщик", 8, ["concrete","formwork","nuclear-grade"], ["Мангышлак"], 1),
            ("Усенов В.Р.", "Бетонщик", 3, ["concrete","vibration"], ["Алматы"], None),
            ("Копбаев Д.А.", "Бетонщик", 11, ["concrete","nuclear-grade","testing"], ["Балтийская АЭС"], 1),
            ("Лебедев К.С.", "Бетонщик", 5, ["concrete","formwork","safety"], ["Темиртау"], None),
            ("Шалгынбаев А.О.", "Бетонщик", 7, ["concrete","QC","formwork"], ["Karaganda HPP"], 1),

            ("Кабдешов И.Т.", "Арматурщик", 5, ["rebar","tying","blueprints"], ["Астана"], 0),
            ("Сулейменов Р.Г.", "Арматурщик", 9, ["rebar","nuclear-grade","welding"], ["Аккую"], 0),
            ("Асанов Б.К.", "Арматурщик", 3, ["rebar","tying"], ["Алматы метро"], None),
            ("Мухамедов Д.С.", "Арматурщик", 7, ["rebar","blueprints","QC"], ["Балхаш ГЭС"], 0),
            ("Морозов С.А.", "Арматурщик", 4, ["rebar","tying","safety"], ["Нур-Султан"], None),
            ("Кулбаев Н.В.", "Арматурщик", 6, ["rebar","nuclear-grade","inspection"], ["Мангышлак"], 0),

            ("Жаксыбеков А.М.", "Крановщик", 10, ["crane","rigging","safety"], ["Karaganda HPP"], 1),
            ("Бекбосынов Т.Д.", "Крановщик", 7, ["crane","overhead-crane","rigging"], ["Temirtau"], 1),
            ("Попов В.Н.", "Крановщик", 5, ["crane","safety","rigging"], ["Астана"], None),
            ("Козлов А.Р.", "Крановщик", 8, ["crane","tower-crane","rigging"], ["Алматы"], 0),
            ("Акимов Д.Б.", "Крановщик", 3, ["crane","rigging"], ["Нур-Султан"], None),

            ("Бекетов К.А.", "Монтажник конструкций", 8, ["steel-erection","bolting","safety"], ["Аккую"], 0),
            ("Смирнов И.Т.", "Монтажник конструкций", 6, ["steel-erection","welding","rigging"], ["Балтийская АЭС"], 0),
            ("Жумагалиев С.Б.", "Монтажник конструкций", 5, ["steel-erection","nuclear-grade","bolting"], ["Astana stadium"], None),
            ("Оспанов Д.К.", "Монтажник конструкций", 11, ["steel-erection","nuclear-grade","QC"], ["Белорусская АЭС"], 0),
            ("Ильясов Р.Н.", "Монтажник конструкций", 4, ["steel-erection","bolting"], ["Алматы"], None),
            ("Рахимов А.С.", "Монтажник конструкций", 9, ["steel-erection","rigging","blueprints"], ["Karaganda HPP"], 1),

            ("Петров В.А.", "Инженер ПТО", 12, ["blueprints","scheduling","AutoCAD"], ["Astana metro"], 0),
            ("Аманов Е.Б.", "Инженер ПТО", 8, ["blueprints","Revit","scheduling"], ["Аккую"], None),
            ("Сидоров Г.В.", "Инженер ПТО", 6, ["blueprints","AutoCAD","QC"], ["Нур-Султан"], None),
            ("Иванов Д.С.", "Инженер ПТО", 10, ["blueprints","nuclear-grade","scheduling"], ["Смоленская АЭС"], None),
            ("Нурланов А.К.", "Инженер ПТО", 7, ["blueprints","Revit","BIM"], ["Балхаш"], None),

            ("Байсеитов К.М.", "Прораб", 15, ["management","scheduling","construction"], ["Аккую","Алматы метро"], 0),
            ("Серiков Т.А.", "Прораб", 18, ["management","nuclear-grade","construction"], ["Белорусская АЭС"], 1),
            ("Козлов Н.Д.", "Прораб", 13, ["management","scheduling","safety"], ["Балтийская АЭС"], 2),
            ("Ахметов Б.С.", "Прораб", 9, ["management","construction","blueprints"], ["Karaganda HPP"], None),
            ("Лебедев В.К.", "Прораб", 11, ["management","construction","QC"], ["Нур-Султан"], None),

            ("Жексенов А.Т.", "Механик", 7, ["mechanics","hydraulics","maintenance"], ["Балхаш ГЭС"], 1),
            ("Токтаров Д.Б.", "Механик", 5, ["mechanics","pneumatics","safety"], ["Астана"], None),
            ("Волков С.Р.", "Механик", 9, ["mechanics","nuclear-grade","maintenance"], ["Аккую"], None),
            ("Аблаев К.Н.", "Механик", 6, ["mechanics","hydraulics","pumps"], ["Темиртау"], 2),
            ("Морозов А.В.", "Механик", 4, ["mechanics","maintenance"], ["Алматы"], None),

            ("Кенесов Б.А.", "Слесарь-монтажник", 8, ["pipefitting","welding","nuclear-grade"], ["Аккую"], 0),
            ("Джаксыбеков Т.С.", "Слесарь-монтажник", 5, ["pipefitting","hydraulics","safety"], ["Астана"], None),
            ("Рустемов Д.К.", "Слесарь-монтажник", 10, ["pipefitting","nuclear-grade","NDT"], ["Белорусская АЭС"], 1),
            ("Алибеков Н.Р.", "Слесарь-монтажник", 6, ["pipefitting","welding","inspection"], ["Karaganda HPP"], None),
            ("Попов И.М.", "Слесарь-монтажник", 7, ["pipefitting","hydraulics","safety"], ["Нур-Султан"], 2),

            ("Дюсупов А.К.", "Специалист ядерной безопасности", 12, ["nuclear-safety","IAEA","PSA","risk-assessment"], ["Аккую","Мангышлак"], None),
            ("Сатыбалдиев Т.Б.", "Специалист ядерной безопасности", 9, ["nuclear-safety","IAEA","radiation-protection"], ["Балтийская АЭС"], None),
            ("Байгалиев К.С.", "Специалист ядерной безопасности", 15, ["nuclear-safety","PSA","emergency-planning"], ["Белорусская АЭС"], None),
            ("Иванченко Р.А.", "Специалист ядерной безопасности", 11, ["nuclear-safety","IAEA","QA"], ["Смоленская АЭС"], None),

            ("Мусаев Б.Д.", "Дозиметрист", 7, ["dosimetry","radiation-protection","monitoring"], ["Мангышлак АЭС"], None),
            ("Нуртаев А.К.", "Дозиметрист", 5, ["dosimetry","IAEA","monitoring"], ["Аккую"], None),
            ("Сагинтаев Т.Н.", "Дозиметрист", 9, ["dosimetry","nuclear-grade","radiation-protection"], ["Белорусская АЭС"], None),

            ("Темирбеков Д.А.", "Геодезист", 8, ["surveying","GPS","AutoCAD"], ["Нур-Султан"], None),
            ("Ергалиев К.Б.", "Геодезист", 6, ["surveying","total-station","blueprints"], ["Аккую"], None),
            ("Борисов А.С.", "Геодезист", 10, ["surveying","GPS","leveling"], ["Балтийская АЭС"], None),

            ("Абенов Н.Т.", "Инженер по ОТ", 9, ["safety","OHSAS","risk-assessment"], ["Аккую"], None),
            ("Халилов Д.Р.", "Инженер по ОТ", 7, ["safety","ISO45001","nuclear-grade"], ["Белорусская АЭС"], None),
            ("Кузнецов С.В.", "Инженер по ОТ", 5, ["safety","OHSAS","fire-protection"], ["Астана"], None),
            ("Жолдасов А.Б.", "Инженер по ОТ", 11, ["safety","nuclear-grade","emergency-planning"], ["Мангышлак"], None),

            ("Конысбаев Т.А.", "Контролер ОТК", 8, ["QC","NDT","nuclear-grade","inspection"], ["Аккую"], None),
            ("Серiков Д.Б.", "Контролер ОТК", 6, ["QC","inspection","ISO9001"], ["Балтийская АЭС"], None),
            ("Файзулин Р.К.", "Контролер ОТК", 10, ["QC","nuclear-grade","radiography"], ["Белорусская АЭС"], None),
            ("Петренко А.С.", "Контролер ОТК", 5, ["QC","inspection","documentation"], ["Нур-Султан"], None),

            ("Джумабаев К.Т.", "Водитель спецтехники", 6, ["excavator","bulldozer","safety"], ["Karaganda HPP"], 1),
            ("Темиргалиев Б.Д.", "Водитель спецтехники", 4, ["truck","safety"], ["Астана"], None),
            ("Назаров А.К.", "Водитель спецтехники", 8, ["excavator","crane","rigging"], ["Алматы"], 1),
            ("Григорьев В.Н.", "Водитель спецтехники", 5, ["bulldozer","grader","safety"], ["Темиртау"], None),

            ("Асылбеков Д.М.", "Изолировщик", 7, ["insulation","nuclear-grade","thermal"], ["Аккую"], 0),
            ("Маратов Т.С.", "Изолировщик", 5, ["insulation","fire-protection","thermal"], ["Астана"], None),
            ("Бейсенов К.А.", "Изолировщик", 9, ["insulation","nuclear-grade","acoustic"], ["Белорусская АЭС"], 0),
            ("Николаев Р.В.", "Изолировщик", 4, ["insulation","thermal","safety"], ["Нур-Султан"], None),

            ("Ибрагимов А.Т.", "Плотник", 6, ["carpentry","formwork","safety"], ["Астана"], 1),
            ("Оразов Д.Б.", "Плотник", 4, ["carpentry","formwork"], ["Алматы"], None),
            ("Тусупбеков Н.К.", "Плотник", 8, ["carpentry","nuclear-grade","formwork"], ["Аккую"], 1),

            ("Алiев М.Д.", "Каменщик", 7, ["masonry","nuclear-grade","QC"], ["Аккую"], None),
            ("Сариев Б.Т.", "Каменщик", 5, ["masonry","bricklaying","safety"], ["Астана"], None),
            ("Кенжеханов Д.А.", "Каменщик", 9, ["masonry","nuclear-grade","inspection"], ["Балтийская АЭС"], None),
        ]

        for name, pos, exp, skills, projects, b_idx in _DATA:
            brigade_id = bid[b_idx % len(bid)] if b_idx is not None and bid else None
            self.db.add(em.Employee(
                full_name=name, position=pos, experience_years=exp,
                skills=skills, past_projects=projects,
                source=CandidateSource.MANUAL, brigade_id=brigade_id,
            ))
