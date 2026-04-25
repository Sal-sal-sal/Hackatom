# NPP Management API — Endpoints & Response Formats

Base: FastAPI app (`backend/app/main.py`), title `NPP Management API` v1.0.0.
All responses are JSON. Dates: `YYYY-MM-DD`. Datetimes: ISO‑8601.

## Enums
- `Priority`: `high | medium | low`
- `Complexity`: `simple | medium | hard`
- `Status`: `todo | in_progress | done`
- `DeadlineType`: `supply | hr | general`
- `CandidateSource`: `hh | linkedin | manual`

---

## Meta

### `GET /`
```json
{ "status": "ok", "service": "NPP Management API" }
```

---

## Employ (`/employ`)

### `GET /employ/brigades` → `BrigadeOut[]`
### `POST /employ/brigades` → `BrigadeOut` (201)
```json
{
  "id": 1,
  "name": "Brigade Alpha",
  "leader_name": "Ivan Petrov",
  "members_count": 12,
  "specialization": "concrete",
  "created_at": "2026-04-25T10:00:00"
}
```

### `GET /employ/brigades/{brigade_id}` → `BrigadeDetail`
`BrigadeOut` + `employees: EmployeeOut[]`.

### `GET /employ/employees?brigade_id=&position=` → `EmployeeOut[]`
### `POST /employ/employees` → `EmployeeOut` (201)
```json
{
  "id": 5,
  "full_name": "Anna Smirnova",
  "position": "welder",
  "experience_years": 7,
  "skills": ["TIG", "MIG"],
  "past_projects": ["NPP-1"],
  "source": "manual",
  "brigade_id": 1,
  "created_at": "2026-04-25T10:00:00"
}
```

### `GET /employ/vacancies` → `VacancyOut[]`
### `POST /employ/vacancies` → `VacancyOut` (201)
```json
{
  "id": 3,
  "role": "Senior welder",
  "required_skills": ["TIG"],
  "priority": "high",
  "complexity": "hard",
  "hire_by_date": "2026-06-01",
  "status": "todo",
  "created_at": "2026-04-25T10:00:00"
}
```

### `POST /employ/vacancies/{vacancy_id}/search-candidates` → `CandidateMatch[]`
Body: `{ "source": "hh" | "linkedin" | "manual" }`
```json
[{
  "full_name": "Sergey K.",
  "position": "welder",
  "experience_years": 9,
  "skills": ["TIG"],
  "past_projects": ["NPP-2"],
  "source": "hh",
  "match_score": 87,
  "url": "https://hh.ru/resume/...",
  "employer": "Rosatom",
  "location": "Moscow",
  "salary": "200000 RUB",
  "source_id": "hh_12345"
}]
```

### `POST /employ/vacancies/{vacancy_id}/shortlist/{employee_id}` → `EmployeeOut`

---

## Supplies (`/supplies`)

### `GET /supplies?status=&priority=&complexity=` → `SupplyOut[]`
### `POST /supplies` → `SupplyOut` (201)
### `GET /supplies/{supply_id}` → `SupplyOut`
### `PATCH /supplies/{supply_id}` → `SupplyOut`
Body: `{ status?, progress?, note? }`
### `DELETE /supplies/{supply_id}` → 204 No Content

`SupplyOut`:
```json
{
  "id": 10,
  "material_name": "Reinforced steel",
  "quantity": 500.0,
  "unit": "ton",
  "supplier_id": 2,
  "priority": "high",
  "complexity": "medium",
  "status": "in_progress",
  "deadline": "2026-07-15",
  "progress": 40,
  "nuclear_grade_required": true,
  "note": "",
  "created_at": "2026-04-25T10:00:00",
  "updated_at": "2026-04-25T10:00:00"
}
```

### `GET /supplies/suppliers` → `SupplierOut[]`
```json
{
  "id": 2,
  "name": "AtomSteel Ltd",
  "location": "Saint Petersburg",
  "country": "RU",
  "nuclear_certified": true,
  "rating": 4.7,
  "contact_info": "info@atomsteel.ru",
  "created_at": "2026-04-25T10:00:00"
}
```

### `POST /supplies/{supply_id}/find-supplier` → `SupplierMatch[]`
```json
[{ "id": 2, "name": "AtomSteel Ltd", "rating": 4.7,
   "nuclear_certified": true, "location": "SPb", "score": 92 }]
```

### `POST /supplies/{supply_id}/assign-supplier/{supplier_id}` → `SupplyOut`

---

## Deadlines (`/deadlines`)

### `GET /deadlines?status=&priority=&type=&overdue=` → `DeadlineOut[]`
### `POST /deadlines` → `DeadlineOut` (201)
### `PATCH /deadlines/{deadline_id}` → `DeadlineOut`
### `DELETE /deadlines/{deadline_id}` → 204 No Content

`DeadlineOut`:
```json
{
  "id": 1,
  "title": "Pour foundation",
  "description": "Block A foundation",
  "type": "general",
  "priority": "high",
  "complexity": "hard",
  "status": "in_progress",
  "deadline_date": "2026-05-30",
  "progress": 60,
  "related_id": null,
  "created_at": "2026-04-25T10:00:00"
}
```

### `GET /deadlines/dashboard` → `DashboardKPI`
```json
{ "total": 42, "completed": 10, "in_progress": 20, "overdue": 3, "upcoming_7days": 5 }
```

### `GET /deadlines/kanban` → `KanbanBoard`
```json
{ "todo": [DeadlineOut...], "in_progress": [DeadlineOut...], "done": [DeadlineOut...] }
```

### `GET /deadlines/alerts` → `DeadlineOut[]`
Overdue / at‑risk deadlines (same shape as `DeadlineOut`).

---

## Dashboard (`/dashboard`)
Aggregated read-only views for the main page. No new tables — reads from `Deadline`, `Supply`, `Employee`.

### `GET /dashboard/kpi` → `DashboardKPI`
Same shape as `/deadlines/dashboard` (alias).

### `GET /dashboard/gantt` → `GanttItem[]`
```json
[{ "id": 1, "name": "Foundation reinforcement",
   "start_day": 0, "duration": 18, "progress": 72,
   "category": "foundation" }]
```
`category` ∈ `foundation | electrical | structural | safety` (mapped from `DeadlineType` + title heuristic).

### `GET /dashboard/alerts` → `AlertItem[]`
```json
[{ "id": 4, "title": "DOKA formwork delivery delayed",
   "description": "...", "severity": "critical",
   "timestamp": "2026-04-25T08:00:00" }]
```
`severity=critical` если deadline просрочен; `warning` если `priority=high` и ≤7 дней до deadline.

### `GET /dashboard/activities?limit=10` → `ActivityItem[]`
```json
[{ "id": "d-1", "action": "Created task",
   "target": "Pour foundation", "user": "Project Manager",
   "timestamp": "2026-04-25T10:00:00" }]
```
Объединяет последние записи `Deadline`/`Supply.updated_at`/`Employee` в обратном хронологическом порядке.
