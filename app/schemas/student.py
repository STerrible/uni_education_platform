from datetime import datetime

from pydantic import BaseModel, ConfigDict


# Ответ для курса (упрощённый для студента)
class CourseStudentResponse(BaseModel):
    id: int
    title: str
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)


# Ответ для урока
class LessonStudentResponse(BaseModel):
    id: int
    title: str
    content: str
    course_id: int
    test_id: int | None = None

    model_config = ConfigDict(from_attributes=True)


# Ответ для теста (БЕЗ правильного ответа!)
class TestStudentResponse(BaseModel):
    id: int
    question: str
    options: list[str]
    # correct_answer скрыт от студента

    model_config = ConfigDict(from_attributes=True)


# Запрос на ответ теста
class TestAnswerSubmit(BaseModel):
    answer: str


# Результат проверки теста
class TestResultResponse(BaseModel):
    test_id: int
    is_correct: bool
    correct_answer: str | None = None  # Показываем только если ответ неверный

    model_config = ConfigDict(from_attributes=True)


# Мой курс с прогрессом
class MyCourseResponse(BaseModel):
    course: CourseStudentResponse
    progress: float  # 0.0 - 100.0

    model_config = ConfigDict(from_attributes=True)


# Съема прогресса курса
class CourseProgressResponse(BaseModel):
    course_id: int
    course_title: str
    progress: float
    total_tests_passed: int = 0  # Заглушка, можно доработать позже

    model_config = ConfigDict(from_attributes=True)


class TestResultHistory(BaseModel):
    test_id: int
    question: str
    your_answer: str
    is_correct: bool
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GeneratedTestQuestion(BaseModel):
    question: str
    options: list[str]
    correct_answer: str
    source_lesson_id: int | None = None


class PersonalTestGenerateRequest(BaseModel):
    course_id: int
    questions_count: int = 5


class PersonalTestGenerateResponse(BaseModel):
    course_id: int
    based_on_lessons: list[int]
    questions: list[GeneratedTestQuestion]
