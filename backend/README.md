# NPP Management API — HackAtom 2026

Backend для системы 6D-управления строительством АЭС в Казахстане.
Проект для хакатона **HackAtom от Росатома** (НИЯУ МИФИ).

Покрывает три измерения:
- **4D** — `/deadlines` — планирование и дедлайны
- **5D** — `/supplies` — материальные ресурсы (поставки и поставщики)
- **6D** — `/employ` — человеческие ресурсы (бригады, работники, вакансии)

## Запуск

```bash
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Swagger UI: <http://localhost:8000/docs>
ReDoc: <http://localhost:8000/redoc>

При первом запуске БД (`npp.db`) создаётся и засеивается мок-данными
(казахстанский контекст: Алматы, Темиртау, Астана; КазСтальПром, AlmatyBeton, КазКабель).

## Тесты

```bash
pytest -q
```

## Структура

```
app/
├── main.py             FastAPI + lifespan + CORS + роутеры
├── database.py         SQLAlchemy engine + Base + get_db
├── config.py           Settings из .env
├── seed.py             DatabaseSeeder с мок-данными
├── core/               общие enums + AI matcher
├── employ/             работники / бригады / вакансии
├── supplies/           поставки / поставщики
└── deadlines/          дедлайны / KPI / kanban / alerts
```

См. также `QUICKSTART.md`, `ARCHITECTURE.md`, `API.md`.

## Примеры curl

```bash
# Список бригад
curl http://localhost:8000/employ/brigades

# Поиск кандидатов под вакансию
curl -X POST http://localhost:8000/employ/vacancies/1/search-candidates \
  -H "Content-Type: application/json" -d '{"source":"hh"}'

# KPI дедлайнов
curl http://localhost:8000/deadlines/dashboard

# Поиск поставщика для поставки
curl -X POST http://localhost:8000/supplies/1/find-supplier
```
