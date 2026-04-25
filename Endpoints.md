# NPP Management API — Endpoints

Base: FastAPI app (`backend/app/main.py`), title `NPP Management API` v1.0.0.

## Meta
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health/root status |

## Employ (`/employ`)
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/employ/brigades` | List brigades |
| POST   | `/employ/brigades` | Create brigade |
| GET    | `/employ/brigades/{brigade_id}` | Brigade detail |
| GET    | `/employ/employees?brigade_id=&position=` | List employees (filterable) |
| POST   | `/employ/employees` | Create employee |
| GET    | `/employ/vacancies` | List vacancies |
| POST   | `/employ/vacancies` | Create vacancy |
| POST   | `/employ/vacancies/{vacancy_id}/search-candidates` | AI candidate search (body: source) |
| POST   | `/employ/vacancies/{vacancy_id}/shortlist/{employee_id}` | Shortlist candidate |

## Supplies (`/supplies`)
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/supplies?status=&priority=&complexity=` | List supplies (filterable) |
| POST   | `/supplies` | Create supply |
| GET    | `/supplies/suppliers` | List suppliers |
| GET    | `/supplies/{supply_id}` | Get supply |
| PATCH  | `/supplies/{supply_id}` | Update supply |
| DELETE | `/supplies/{supply_id}` | Delete supply |
| POST   | `/supplies/{supply_id}/find-supplier` | Match suppliers |
| POST   | `/supplies/{supply_id}/assign-supplier/{supplier_id}` | Assign supplier |

## Deadlines (`/deadlines`)
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/deadlines?status=&priority=&type=&overdue=` | List deadlines (filterable) |
| POST   | `/deadlines` | Create deadline |
| GET    | `/deadlines/dashboard` | KPI dashboard |
| GET    | `/deadlines/kanban` | Kanban board |
| GET    | `/deadlines/alerts` | Alerts (overdue/at-risk) |
| PATCH  | `/deadlines/{deadline_id}` | Update deadline |
| DELETE | `/deadlines/{deadline_id}` | Delete deadline |
