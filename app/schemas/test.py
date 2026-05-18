from pydantic import BaseModel, ConfigDict


class TestCreate(BaseModel):
    question: str
    options: list[str]  # ["Вариант 1", "Вариант 2", ...]
    correct_answer: str


class TestUpdate(BaseModel):
    question: str | None = None
    options: list[str] | None = None
    correct_answer: str | None = None


class TestResponse(BaseModel):
    id: int
    question: str
    options: list[str]
    correct_answer: str

    model_config = ConfigDict(from_attributes=True)
