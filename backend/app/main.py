from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, SessionLocal, engine
from app.seed import DatabaseSeeder

from app.employ.router import router as employ_router
from app.supplies.router import router as supplies_router
from app.deadlines.router import router as deadlines_router
from app.dashboard.router import router as dashboard_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        DatabaseSeeder(db).run()
    finally:
        db.close()
    yield


app = FastAPI(title="NPP Management API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

app.include_router(employ_router)
app.include_router(supplies_router)
app.include_router(deadlines_router)
app.include_router(dashboard_router)


@app.get("/", tags=["meta"])
def root():
    return {"status": "ok", "service": "NPP Management API"}
