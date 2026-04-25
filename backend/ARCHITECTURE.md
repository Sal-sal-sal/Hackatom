# ARCHITECTURE

## Идея
6D-управление строительством АЭС. Бэкенд покрывает 4D/5D/6D через три
независимых модуля с одинаковой структурой (router → service → models/schemas).

## Слои

```
HTTP   →  FastAPI router  (валидация, статус-коды, DI)
          ↓
          service          (бизнес-логика, оркестрация запросов)
          ↓
          SQLAlchemy ORM  (модели, БД)
```

Сервисы — чистые функции, принимающие `Session`. Это упрощает тестирование
и позволяет переиспользовать логику между HTTP-эндпоинтами и фоновыми задачами.

## Модули

| Модуль       | Сущности                          | Ключевая логика                            |
|--------------|-----------------------------------|--------------------------------------------|
| `employ`     | Brigade, Employee, Vacancy        | AI-ранжирование кандидатов (skills+опыт)   |
| `supplies`   | Supplier, Supply                  | Скоринг поставщиков (рейтинг+сертификация) |
| `deadlines`  | Deadline                          | KPI, Kanban-группировка, alerts            |

## Общие компоненты

- `core/enums.py` — `Priority`, `Complexity`, `Status`, `DeadlineType`,
  `CandidateSource`. Используются всеми модулями для консистентности.
- `core/ai_matcher.py` — `similarity_score(profile, requirements)`:
  пересечение skills (70%) + бонус за NPP-проекты (20%) + бонус за опыт (10%).
- `database.py` — единый `Base` для всех моделей, `get_db` как FastAPI DI.
- `seed.py` — `DatabaseSeeder` создаёт демо-данные при первом запуске.

## Поток запроса (пример)

`POST /employ/vacancies/1/search-candidates` →
1. `router.search_candidates` валидирует body через `CandidateSearch`.
2. `service.search_candidates` достаёт `Vacancy`, тянет мок-кандидатов.
3. Для каждого вызывает `ai_matcher.similarity_score`.
4. Сортирует по `match_score` desc, отдаёт `list[CandidateMatch]`.

## Почему так

- **Без классов-сервисов** — для хакатона функции читаются быстрее, меньше
  boilerplate. Классы оставлены только там, где есть состояние (`DatabaseSeeder`).
- **Sync SQLAlchemy** — проще запускать и отлаживать, для фронта-демо async
  не нужен.
- **SQLite по умолчанию** — нулевая конфигурация. Замена на Postgres = одна
  строка в `.env`.
- **Lifespan вместо `on_event`** — `on_event` deprecated в FastAPI 0.110+.
- **Файлы ≤250 строк** — каждый модуль легко охватить взглядом.

## Расширение

- Новый модуль = создать пакет `app/<name>/` с `models.py`, `schemas.py`,
  `service.py`, `router.py`. Подключить роутер в `main.py`.
- Новые мок-данные — добавить метод в `DatabaseSeeder`.
- Замена мок-кандидатов на реальный hh.ru API — заменить `_mock_candidates`
  в `employ/service.py` на вызов внешнего HTTP-клиента, остальное не меняется.
