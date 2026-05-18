import app.models.test as test_model_module
from app.core.security import get_password_hash
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.user import User
from app.models.user_course import UserCourse


def _create_user(db_session, username: str, password: str, is_superuser: bool = False) -> User:
    user = User(
        username=username,
        hashed_password=get_password_hash(password),
        is_active=True,
        is_superuser=is_superuser,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _login(client, username: str, password: str) -> str:
    response = client.post("/api/v1/auth/login", data={"username": username, "password": password})
    assert response.status_code == 200
    return response.json()["access_token"]


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_auth_change_password_and_refresh(client, db_session):
    _create_user(db_session, "student_auth", "oldpass123")
    token = _login(client, "student_auth", "oldpass123")

    change_response = client.post(
        "/api/v1/auth/change-password",
        json={"current_password": "oldpass123", "new_password": "newpass123"},
        headers=_auth_headers(token),
    )
    assert change_response.status_code == 200

    old_login = client.post(
        "/api/v1/auth/login", data={"username": "student_auth", "password": "oldpass123"}
    )
    assert old_login.status_code == 401

    new_token = _login(client, "student_auth", "newpass123")
    refresh = client.post("/api/v1/auth/refresh-token", headers=_auth_headers(new_token))
    assert refresh.status_code == 200
    assert "access_token" in refresh.json()


def test_admin_courses_crud(client, db_session):
    _create_user(db_session, "admin_courses", "adminpass", is_superuser=True)
    token = _login(client, "admin_courses", "adminpass")
    headers = _auth_headers(token)

    created = client.post(
        "/api/v1/admin/courses",
        json={"title": "Backend", "description": "Intro"},
        headers=headers,
    )
    assert created.status_code == 201
    course_id = created.json()["id"]

    listed = client.get("/api/v1/admin/courses")
    assert listed.status_code == 200
    assert len(listed.json()) >= 1

    got = client.get(f"/api/v1/admin/courses/{course_id}")
    assert got.status_code == 200
    assert got.json()["title"] == "Backend"

    updated = client.put(
        f"/api/v1/admin/courses/{course_id}",
        json={"title": "Backend Updated"},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Backend Updated"

    deleted = client.delete(f"/api/v1/admin/courses/{course_id}", headers=headers)
    assert deleted.status_code == 204


def test_admin_tests_and_lessons_crud_with_link(client, db_session):
    _create_user(db_session, "admin_content", "adminpass", is_superuser=True)
    token = _login(client, "admin_content", "adminpass")
    headers = _auth_headers(token)

    course_resp = client.post(
        "/api/v1/admin/courses",
        json={"title": "Python", "description": "Base"},
        headers=headers,
    )
    course_id = course_resp.json()["id"]

    test_resp = client.post(
        "/api/v1/admin/tests",
        json={
            "question": "2+2?",
            "options": ["1", "2", "3", "4"],
            "correct_answer": "4",
        },
        headers=headers,
    )
    assert test_resp.status_code == 201
    test_id = test_resp.json()["id"]

    tests_list = client.get("/api/v1/admin/tests")
    assert tests_list.status_code == 200
    assert len(tests_list.json()) >= 1

    test_get = client.get(f"/api/v1/admin/tests/{test_id}")
    assert test_get.status_code == 200

    test_update = client.put(
        f"/api/v1/admin/tests/{test_id}",
        json={"question": "3+3?", "correct_answer": "6", "options": ["4", "5", "6", "7"]},
        headers=headers,
    )
    assert test_update.status_code == 200
    assert test_update.json()["correct_answer"] == "6"

    lesson_resp = client.post(
        "/api/v1/admin/lessons",
        json={
            "title": "Numbers",
            "content": "Arithmetic basics",
            "course_id": course_id,
            "test_id": test_id,
        },
        headers=headers,
    )
    assert lesson_resp.status_code == 201
    lesson_id = lesson_resp.json()["id"]
    assert lesson_resp.json()["test_id"] == test_id

    lessons_list = client.get("/api/v1/admin/lessons")
    assert lessons_list.status_code == 200
    assert len(lessons_list.json()) >= 1

    lesson_get = client.get(f"/api/v1/admin/lessons/{lesson_id}")
    assert lesson_get.status_code == 200

    lesson_update = client.put(
        f"/api/v1/admin/lessons/{lesson_id}",
        json={"title": "Numbers Updated", "test_id": None},
        headers=headers,
    )
    assert lesson_update.status_code == 200
    assert lesson_update.json()["title"] == "Numbers Updated"
    assert lesson_update.json()["test_id"] is None

    lesson_delete = client.delete(f"/api/v1/admin/lessons/{lesson_id}", headers=headers)
    assert lesson_delete.status_code == 204

    test_delete = client.delete(f"/api/v1/admin/tests/{test_id}", headers=headers)
    assert test_delete.status_code == 204


def test_student_learning_flow_and_profile(client, db_session):
    _create_user(db_session, "student_flow", "pass123")
    token = _login(client, "student_flow", "pass123")
    headers = _auth_headers(token)
    student = db_session.query(User).filter(User.username == "student_flow").first()
    assert student is not None

    course = Course(title="Algorithms", description="Course")
    db_session.add(course)
    db_session.commit()
    db_session.refresh(course)

    test_1 = test_model_module.Test(question="Q1", options=["A", "B", "C", "D"], correct_answer="A")
    test_2 = test_model_module.Test(question="Q2", options=["A", "B", "C", "D"], correct_answer="B")
    db_session.add_all([test_1, test_2])
    db_session.commit()
    db_session.refresh(test_1)
    db_session.refresh(test_2)

    lesson_1 = Lesson(title="L1", content="Content 1", course_id=course.id, test_id=test_1.id)
    lesson_2 = Lesson(title="L2", content="Content 2", course_id=course.id, test_id=test_2.id)
    db_session.add_all([lesson_1, lesson_2])
    db_session.commit()
    db_session.refresh(lesson_1)
    db_session.refresh(lesson_2)

    catalog = client.get("/api/v1/student/courses")
    assert catalog.status_code == 200
    assert len(catalog.json()) == 1

    before_enroll_details = client.get(f"/api/v1/student/courses/{course.id}", headers=headers)
    assert before_enroll_details.status_code == 403

    enroll = client.post(f"/api/v1/student/courses/{course.id}/enroll", headers=headers)
    assert enroll.status_code == 201

    details = client.get(f"/api/v1/student/courses/{course.id}", headers=headers)
    assert details.status_code == 200
    assert len(details.json()["lessons"]) == 2

    second_lesson_locked = client.get(f"/api/v1/student/lessons/{lesson_2.id}", headers=headers)
    assert second_lesson_locked.status_code == 403

    first_lesson = client.get(f"/api/v1/student/lessons/{lesson_1.id}", headers=headers)
    assert first_lesson.status_code == 200

    student_test = client.get(f"/api/v1/student/tests/{test_1.id}")
    assert student_test.status_code == 200
    assert "correct_answer" not in student_test.json()

    wrong_submit = client.post(
        f"/api/v1/student/tests/{test_1.id}/submit",
        json={"answer": "wrong"},
        headers=headers,
    )
    assert wrong_submit.status_code == 200
    assert wrong_submit.json()["is_correct"] is False
    assert wrong_submit.json()["correct_answer"] == "A"

    still_locked = client.get(f"/api/v1/student/lessons/{lesson_2.id}", headers=headers)
    assert still_locked.status_code == 403

    correct_submit = client.post(
        f"/api/v1/student/tests/{test_1.id}/submit",
        json={"answer": "A"},
        headers=headers,
    )
    assert correct_submit.status_code == 200
    assert correct_submit.json()["is_correct"] is True

    second_lesson_open = client.get(f"/api/v1/student/lessons/{lesson_2.id}", headers=headers)
    assert second_lesson_open.status_code == 200

    my_courses = client.get("/api/v1/student/my-courses", headers=headers)
    assert my_courses.status_code == 200
    assert len(my_courses.json()) == 1
    assert my_courses.json()[0]["progress"] == 5.0

    history = client.get("/api/v1/student/test-history", headers=headers)
    assert history.status_code == 200
    assert len(history.json()) == 2

    generated = client.post(
        "/api/v1/student/personal-tests/generate",
        json={"course_id": course.id, "questions_count": 3},
        headers=headers,
    )
    assert generated.status_code == 200
    assert generated.json()["course_id"] == course.id
    assert len(generated.json()["questions"]) == 3

    enrollment = (
        db_session.query(UserCourse)
        .filter(UserCourse.user_id == student.id, UserCourse.course_id == course.id)
        .first()
    )
    assert enrollment is not None
