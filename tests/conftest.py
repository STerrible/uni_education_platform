from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from testcontainers.postgres import PostgresContainer

from app.core.deps import get_db
from app.main import app


@pytest.fixture(scope="session")
def postgres_url() -> Iterator[str]:
    with PostgresContainer(
        "postgres:15-alpine",
        username="postgres",
        password="postgres",
        dbname="educational_platform_test",
    ) as postgres:
        yield postgres.get_connection_url()


@pytest.fixture(scope="session")
def engine(postgres_url: str):
    return create_engine(postgres_url, pool_pre_ping=True)


@pytest.fixture(scope="session")
def testing_session_factory(engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session(engine, testing_session_factory):
    from app.core.database import Base

    Base.metadata.create_all(bind=engine)
    db = testing_session_factory()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
