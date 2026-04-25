import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ["DATABASE_URL"] = "sqlite:///./test_npp.db"


@pytest.fixture(scope="session")
def client(tmp_path_factory):
    db_path = tmp_path_factory.mktemp("db") / "test.db"
    os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"

    from app import database, config
    config.settings.database_url = os.environ["DATABASE_URL"]
    database.engine = create_engine(os.environ["DATABASE_URL"],
                                    connect_args={"check_same_thread": False})
    database.SessionLocal = sessionmaker(bind=database.engine, autoflush=False, autocommit=False)

    from app.main import app
    with TestClient(app) as c:
        yield c
