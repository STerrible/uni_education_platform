import pytest

from app.core.security import get_password_hash
from app.models.course import Course
from app.models.user import User


@pytest.fixture
def admin_token(client, db_session):
    # Создаём админа
    admin = User(
        username="admin",
        hashed_password=get_password_hash("adminpass"),
        is_active=True,
        is_superuser=True,
    )
    db_session.add(admin)
    db_session.commit()

    # Логинимся
    response = client.post(
        "/api/v1/auth/login", data={"username": "admin", "password": "adminpass"}
    )
    return response.json()["access_token"]


def test_create_course(client, admin_token, db_session):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.post(
        "/api/v1/admin/courses",
        json={"title": "Test Course", "description": "Test Description"},
        headers=headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Course"
    assert data["id"] == 1


def test_list_courses(client, db_session):
    # Создаём тестовый курс
    course = Course(title="Course 1", description="Desc 1")
    db_session.add(course)
    db_session.commit()

    response = client.get("/api/v1/student/courses")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Course 1"
