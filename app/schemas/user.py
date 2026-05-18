from pydantic import BaseModel, ConfigDict


class UserCreate(BaseModel):
    username: str
    password: str
    first_name: str | None = None
    last_name: str | None = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    first_name: str | None = None
    last_name: str | None = None
    is_active: bool
    is_superuser: bool

    # Разрешаем создавать схему из объекта SQLAlchemy
    model_config = ConfigDict(from_attributes=True)
