from pydantic import BaseModel, ConfigDict


# Схема для создания курса (что принимает админ)
class CourseCreate(BaseModel):
    title: str
    description: str | None = None


# Схема для обновления курса
class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None


# Схема ответа (что отдаём клиенту)
class CourseResponse(BaseModel):
    id: int
    title: str
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)
