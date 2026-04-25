# API Reference

Базовый URL: `http://localhost:8000`
Полная интерактивная документация: `/docs`

## Meta

| Метод | Путь | Описание                            |
|------:|------|-------------------------------------|
| GET   | `/`  | Health-check `{status, service}`    |

## Employ — `/employ`

| Метод  | Путь                                                | Описание                                |
|-------:|-----------------------------------------------------|-----------------------------------------|
| GET    | `/employ/brigades`                                   | Список бригад                           |
| POST   | `/employ/brigades`                                   | Создать бригаду                         |
| GET    | `/employ/brigades/{id}`                              | Детали бригады с работниками            |
| GET    | `/employ/employees?brigade_id&position`              | Работники с фильтрами                   |
| POST   | `/employ/employees`                                  | Добавить работника                      |
| GET    | `/employ/vacancies`                                  | Открытые вакансии                       |
| POST   | `/employ/vacancies`                                  | Создать вакансию                        |
| POST   | `/employ/vacancies/{id}/search-candidates`           | AI-поиск кандидатов (body: `{source}`)  |
| POST   | `/employ/vacancies/{id}/shortlist/{employee_id}`     | Добавить в шортлист                     |

### Пример: AI-поиск
```bash
curl -X POST http://localhost:8000/employ/vacancies/1/search-candidates \
  -H "Content-Type: application/json" -d '{"source":"linkedin"}'
```
Ответ: список кандидатов, отсортированный по `match_score` (0–100).

## Supplies — `/supplies`

| Метод  | Путь                                                 | Описание                                |
|-------:|------------------------------------------------------|-----------------------------------------|
| GET    | `/supplies?status&priority&complexity`               | Список поставок с фильтрами             |
| POST   | `/supplies`                                           | Создать поставку                        |
| GET    | `/supplies/{id}`                                      | Детали                                  |
| PATCH  | `/supplies/{id}`                                      | Обновить статус/прогресс/заметку        |
| DELETE | `/supplies/{id}`                                      | Удалить                                 |
| POST   | `/supplies/{id}/find-supplier`                        | Ранжированный список поставщиков        |
| POST   | `/supplies/{id}/assign-supplier/{supplier_id}`        | Назначить поставщика                    |
| GET    | `/supplies/suppliers`                                 | Все поставщики                          |

### Пример: обновление прогресса
```bash
curl -X PATCH http://localhost:8000/supplies/1 \
  -H "Content-Type: application/json" \
  -d '{"progress": 75, "status": "in_progress"}'
```

## Deadlines — `/deadlines`

| Метод  | Путь                                                | Описание                                |
|-------:|-----------------------------------------------------|-----------------------------------------|
| GET    | `/deadlines?status&priority&type&overdue`           | Список с фильтрами                      |
| POST   | `/deadlines`                                         | Создать                                 |
| PATCH  | `/deadlines/{id}`                                    | Обновить                                |
| DELETE | `/deadlines/{id}`                                    | Удалить                                 |
| GET    | `/deadlines/dashboard`                               | KPI: total, completed, in_progress, overdue, upcoming_7days |
| GET    | `/deadlines/kanban`                                  | Группировка `{todo, in_progress, done}` |
| GET    | `/deadlines/alerts`                                  | Горящие (≤7 дней + просроченные)        |

### Пример: канбан-доска
```bash
curl http://localhost:8000/deadlines/kanban
```

## Enums

| Enum         | Values                              |
|--------------|-------------------------------------|
| Priority     | `high`, `medium`, `low`             |
| Complexity   | `simple`, `medium`, `hard`          |
| Status       | `todo`, `in_progress`, `done`       |
| DeadlineType | `supply`, `hr`, `general`           |
| Source       | `hh`, `linkedin`, `manual`          |

## Коды ответов

| Код | Когда                                        |
|----:|----------------------------------------------|
| 200 | OK (GET, PATCH, POST с возвратом ресурса)    |
| 201 | Created (POST создания ресурса)              |
| 204 | No Content (DELETE)                          |
| 404 | Ресурс не найден                             |
| 422 | Ошибка валидации Pydantic                    |
