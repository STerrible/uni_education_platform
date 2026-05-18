from pydantic import BaseModel, ConfigDict


class LessonCreate(BaseModel):
    title: str
    content: str
    course_id: int


class LessonUpdate(BaseModel):
    title: str | None = None
    content: str | None = None


class LessonResponse(BaseModel):
    id: int
    title: str
    content: str
    course_id: int

    model_config = ConfigDict(from_attributes=True)
