from pydantic import BaseModel, ConfigDict


class LessonCreate(BaseModel):
    title: str
    content: str
    course_id: int
    test_id: int | None = None


class LessonUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    test_id: int | None = None


class LessonResponse(BaseModel):
    id: int
    title: str
    content: str
    course_id: int
    test_id: int | None = None

    model_config = ConfigDict(from_attributes=True)
