from typing import Any, cast

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.test import Test
from app.models.test_result import UserTestResult
from app.models.user import User
from app.models.user_course import UserCourse
from app.schemas.student import (
    CourseStudentResponse,
    GeneratedTestQuestion,
    LessonStudentResponse,
    MyCourseResponse,
    PersonalTestGenerateRequest,
    PersonalTestGenerateResponse,
    TestAnswerSubmit,
    TestResultHistory,
    TestResultResponse,
    TestStudentResponse,
)
from app.services.personal_test_generator import generate_personal_questions

router = APIRouter(prefix="/api/v1/student", tags=["Student"])


def _get_enrollment_or_403(db: Session, user_id: int, course_id: int) -> UserCourse:
    enrollment = (
        db.query(UserCourse)
        .filter(UserCourse.user_id == user_id, UserCourse.course_id == course_id)
        .first()
    )
    if not enrollment:
        raise HTTPException(status_code=403, detail="Сначала запишитесь на курс")
    return enrollment


# 1. Каталог всех курсов
@router.get("/courses", response_model=list[CourseStudentResponse])
def get_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()


# 2. Детали курса + список уроков
@router.get("/courses/{course_id}", response_model=dict)
def get_course_details(
    course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Курс не найден")
    _get_enrollment_or_403(db, cast(int, current_user.id), course_id)

    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).all()
    return {
        "course": CourseStudentResponse.model_validate(course),
        "lessons": [LessonStudentResponse.model_validate(lesson) for lesson in lessons],
    }


# 3. Получить конкретный урок
@router.get("/lessons/{lesson_id}", response_model=LessonStudentResponse)
def get_lesson(
    lesson_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")
    course_id = cast(int, lesson.course_id)
    _get_enrollment_or_403(db, cast(int, current_user.id), course_id)

    ordered_lessons = (
        db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.id.asc()).all()
    )
    lesson_ids = [cast(int, ls.id) for ls in ordered_lessons]
    current_index = lesson_ids.index(cast(int, lesson.id))
    if current_index > 0:
        prev_lesson = ordered_lessons[current_index - 1]
        if prev_lesson.test_id is not None:
            prev_passed = (
                db.query(UserTestResult)
                .filter(
                    UserTestResult.user_id == current_user.id,
                    UserTestResult.test_id == prev_lesson.test_id,
                    UserTestResult.is_correct.is_(True),
                )
                .first()
            )
            if not prev_passed:
                raise HTTPException(
                    status_code=403,
                    detail="Сначала завершите предыдущий урок и его тест",
                )
    return lesson


# 4. Получить тест (без ответа)
@router.get("/tests/{test_id}", response_model=TestStudentResponse)
def get_test(test_id: int, db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Тест не найден")
    return test


# 🔹 НОВОЕ: Записаться на курс
@router.post("/courses/{course_id}/enroll", status_code=status.HTTP_201_CREATED)
def enroll_course(
    course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Курс не найден")

    # Проверяем, не записан ли уже
    exists = (
        db.query(UserCourse)
        .filter(UserCourse.user_id == current_user.id, UserCourse.course_id == course_id)
        .first()
    )
    if exists:
        raise HTTPException(status_code=400, detail="Вы уже записаны на этот курс")

    enrollment = UserCourse(user_id=current_user.id, course_id=course_id, progress=0.0)
    db.add(enrollment)
    db.commit()
    return {"message": f"Вы успешно записались на курс '{course.title}'"}


# 🔹 ОБНОВЛЁННОЕ: Отправить ответ на тест с сохранением прогресса
@router.post("/tests/{test_id}/submit", response_model=TestResultResponse)
def submit_test_answer(
    test_id: int,
    answer_data: TestAnswerSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Тест не найден")

    is_correct = answer_data.answer.strip().lower() == test.correct_answer.strip().lower()

    # Сохраняем результат в историю
    result = UserTestResult(
        user_id=current_user.id, test_id=test_id, answer=answer_data.answer, is_correct=is_correct
    )
    db.add(result)

    lesson = db.query(Lesson).filter(Lesson.test_id == test_id).first()
    if not lesson:
        raise HTTPException(status_code=400, detail="Тест не привязан к уроку")
    enrollment = _get_enrollment_or_403(db, cast(int, current_user.id), cast(int, lesson.course_id))

    # Обновляем прогресс курса (упрощённо: +5% за правильный ответ)
    if enrollment and is_correct:
        current_progress = cast(float, enrollment.progress)
        cast(Any, enrollment).progress = min(100.0, current_progress + 5.0)

    db.commit()

    return TestResultResponse(
        test_id=test_id,
        is_correct=is_correct,
        correct_answer=cast(str | None, test.correct_answer) if not is_correct else None,
    )


# 🔹 НОВОЕ: Личный кабинет: мои курсы
@router.get("/my-courses", response_model=list[MyCourseResponse])
def get_my_courses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_courses = db.query(UserCourse).filter(UserCourse.user_id == current_user.id).all()

    result = []
    for uc in user_courses:
        course = db.query(Course).filter(Course.id == uc.course_id).first()
        if course:
            result.append(
                MyCourseResponse(
                    course=CourseStudentResponse.model_validate(course),
                    progress=cast(float, uc.progress),
                )
            )
    return result


@router.get("/test-history", response_model=list[TestResultHistory])
def get_test_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Просмотр оценок за пройденные тесты"""
    results = (
        db.query(UserTestResult, Test.question)
        .join(Test, UserTestResult.test_id == Test.id)
        .filter(UserTestResult.user_id == current_user.id)
        .order_by(UserTestResult.created_at.desc())
        .all()
    )

    return [
        TestResultHistory(
            test_id=res[0].test_id,
            question=res[1],
            your_answer=res[0].answer,
            is_correct=res[0].is_correct,
            submitted_at=res[0].created_at,
        )
        for res in results
    ]


@router.post("/personal-tests/generate", response_model=PersonalTestGenerateResponse)
def generate_personal_test(
    payload: PersonalTestGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    enrollment = (
        db.query(UserCourse)
        .filter(UserCourse.user_id == current_user.id, UserCourse.course_id == payload.course_id)
        .first()
    )
    if not enrollment:
        raise HTTPException(status_code=403, detail="Сначала запишитесь на курс")

    lessons = db.query(Lesson).filter(Lesson.course_id == payload.course_id).all()
    if not lessons:
        raise HTTPException(status_code=404, detail="В курсе нет материалов для генерации теста")

    generated = generate_personal_questions(
        lessons=lessons, questions_count=max(1, min(payload.questions_count, 15))
    )
    questions = [GeneratedTestQuestion.model_validate(question) for question in generated]

    return PersonalTestGenerateResponse(
        course_id=payload.course_id,
        based_on_lessons=[cast(int, lesson.id) for lesson in lessons],
        questions=questions,
    )
