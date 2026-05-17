from app.core.database import SessionLocal
from app.models.user import User


def make_admin():
    db = SessionLocal()
    try:
        username = input("Введите username пользователя, которого нужно сделать админом: ")
        user = db.query(User).filter(User.username == username).first()

        if user:
            user.is_superuser = True
            db.commit()
            print(f"✅ Пользователь '{username}' теперь администратор!")
        else:
            print(f"❌ Пользователь '{username}' не найден.")
    finally:
        db.close()


if __name__ == "__main__":
    make_admin()
