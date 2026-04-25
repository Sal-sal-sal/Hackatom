from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import Base, SessionLocal, engine
from app.seed import DatabaseSeeder

from app.sectors import models as sector_models  # noqa: F401 - register table
from app.employ.router import router as employ_router
from app.supplies.router import router as supplies_router
from app.deadlines.router import router as deadlines_router
from app.dashboard.router import router as dashboard_router
from app.sectors.router import router as sectors_router


def _migrate(conn):
    """Add new columns that may not exist in older DB files."""
    migrations = [
        "ALTER TABLE deadlines ADD COLUMN start_date DATE",
        "ALTER TABLE brigades ADD COLUMN current_sector_id INTEGER",
        "ALTER TABLE supplies ADD COLUMN sector_id INTEGER",
        "ALTER TABLE deadlines ADD COLUMN sector_id INTEGER",
        "ALTER TABLE deadlines ADD COLUMN brigade_id INTEGER",
    ]
    for sql in migrations:
        try:
            conn.execute(text(sql))
        except Exception:
            pass  # column already exists


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        _migrate(conn)
        conn.commit()
    db = SessionLocal()
    try:
        DatabaseSeeder(db).run()
    finally:
        db.close()
    yield


app = FastAPI(title="NPP Management API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employ_router)
app.include_router(supplies_router)
app.include_router(deadlines_router)
app.include_router(dashboard_router)
app.include_router(sectors_router)


@app.get("/", tags=["meta"])
def root():
    return {"status": "ok", "service": "NPP Management API"}
