from app.core.security import get_password_hash
from app.models.user import User


# Тест регистрации
def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "password": "testpass123",
            "first_name": "Test",
            "last_name": "User",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert data["first_name"] == "Test"
    assert "hashed_password" not in data  # Пароль не должен возвращаться


# Тест входа
def test_login_user(client, db_session):
    # Создаём пользователя
    user = User(
        username="loginuser", hashed_password=get_password_hash("password123"), is_active=True
    )
    db_session.add(user)
    db_session.commit()

    # Пробуем войти
    response = client.post(
        "/api/v1/auth/login", data={"username": "loginuser", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


# Тест неверного пароля
def test_login_wrong_password(client, db_session):
    user = User(
        username="wrongpassuser", hashed_password=get_password_hash("correctpass"), is_active=True
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/api/v1/auth/login", data={"username": "wrongpassuser", "password": "wrongpass"}
    )
    assert response.status_code == 401
