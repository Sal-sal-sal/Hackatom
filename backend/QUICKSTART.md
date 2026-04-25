# QUICKSTART — за 2 минуты

## 1. Подготовка окружения
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

## 2. Запуск сервера
```bash
uvicorn app.main:app --reload
```

Сервер: <http://localhost:8000>
Swagger: <http://localhost:8000/docs>

## 3. Проверка
```bash
curl http://localhost:8000/                      # {"status":"ok",...}
curl http://localhost:8000/employ/brigades       # 3 seeded brigades
curl http://localhost:8000/deadlines/dashboard   # KPI
```

## 4. Тесты
```bash
pytest -q
```

## Сброс БД
Удали `npp.db` — при следующем запуске пересоздастся и засеется заново.

## Типичные проблемы
- **`ModuleNotFoundError: app`** — запускай `uvicorn` из папки `backend/`.
- **CORS-ошибки** — уже разрешено `*` для разработки в `app/main.py`.
- **Порт занят** — `uvicorn app.main:app --reload --port 8001`.
