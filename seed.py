import sys
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.test import Test
from app.models.user_course import UserCourse
from app.models.test_result import UserTestResult

def seed_db():
    print("🌱 Starting database seeding...")
    db = SessionLocal()
    
    try:
        # Clear existing data in correct order to prevent foreign key issues
        print("🧹 Clearing existing data...")
        db.query(UserTestResult).delete()
        db.query(UserCourse).delete()
        db.query(Lesson).delete()
        db.query(Test).delete()
        db.query(Course).delete()
        db.query(User).delete()
        db.commit()
        print("🧹 Database cleared.")

        # 1. Create Users
        print("👤 Creating users...")
        admin = User(
            username="admin",
            first_name="Иван",
            last_name="Админов",
            hashed_password=get_password_hash("adminpass"),
            is_active=True,
            is_superuser=True
        )
        student = User(
            username="student",
            first_name="Петр",
            last_name="Студентов",
            hashed_password=get_password_hash("studentpass"),
            is_active=True,
            is_superuser=False
        )
        db.add(admin)
        db.add(student)
        db.commit()
        print(f"✅ Users created: admin (password: adminpass), student (password: studentpass)")

        # Helper to add test and return it
        def create_test(question, options, correct):
            t = Test(question=question, options=options, correct_answer=correct)
            db.add(t)
            db.commit()
            db.refresh(t)
            return t

        # Course 1: Основы Python
        print("📚 Creating Course: Основы Python...")
        course1 = Course(
            title="Основы Python",
            description="Изучите основы программирования на Python с нуля. Переменные, ветвления, циклы и функции."
        )
        db.add(course1)
        db.commit()
        db.refresh(course1)

        t1 = create_test("Что выведет print(2 ** 3)?", ["6", "8", "9", "23"], "8")
        l1 = Lesson(
            title="Введение в Python",
            content="Python — это популярный высокоуровневый язык программирования. Он славится своей простотой и читаемостью. В этом уроке мы научимся выводить информацию на экран с помощью функции print() и познакомимся с базовыми арифметическими операциями вроде возведения в степень (**).",
            course_id=course1.id,
            test_id=t1.id
        )

        t2 = create_test("Какой оператор используется для проверки равенства двух значений?", ["=", "==", "is", "equal"], "==")
        l2 = Lesson(
            title="Управляющие конструкции: if, elif, else",
            content="Управляющие конструкции позволяют выполнять разные блоки кода в зависимости от условий. Для проверки условий используются логические операторы сравнения. Не путайте оператор присваивания (=) и оператор сравнения (==).",
            course_id=course1.id,
            test_id=t2.id
        )

        t3 = create_test("Какое ключевое слово используется для создания (объявления) функции?", ["function", "func", "def", "define"], "def")
        l3 = Lesson(
            title="Определение и вызов функций",
            content="Функции помогают структурировать код и избегать дублирования. Они объявляются ключевым словом 'def', принимают параметры и могут возвращать значение через инструкцию 'return'.",
            course_id=course1.id,
            test_id=t3.id
        )

        db.add_all([l1, l2, l3])
        db.commit()

        # Course 2: Веб-разработка на FastAPI
        print("📚 Creating Course: Веб-разработка на FastAPI...")
        course2 = Course(
            title="Веб-разработка на FastAPI",
            description="Создавайте современные быстрые API с помощью FastAPI, SQLAlchemy и PostgreSQL."
        )
        db.add(course2)
        db.commit()
        db.refresh(course2)

        t4 = create_test("Какой декоратор используется для создания GET-эндпоинта во FastAPI?", ["@app.get", "@app.route", "@app.post", "@app.request"], "@app.get")
        l4 = Lesson(
            title="Первые шаги с FastAPI",
            content="FastAPI — это быстрый, интуитивный фреймворк для создания API. Для объявления эндпоинтов используются декораторы вроде @app.get('/path'), навешиваемые над асинхронными функциями.",
            course_id=course2.id,
            test_id=t4.id
        )

        t5 = create_test("Какая функция FastAPI используется для декларации зависимостей в эндпоинтах?", ["Depends", "Inject", "get_db", "Provide"], "Depends")
        l5 = Lesson(
            title="Внедрение зависимостей (Dependency Injection)",
            content="Внедрение зависимостей во FastAPI осуществляется через функцию Depends. Она позволяет повторно использовать логику подключения к БД, авторизации и валидации в эндпоинтах.",
            course_id=course2.id,
            test_id=t5.id
        )

        db.add_all([l4, l5])
        db.commit()

        # Course 3: Базы данных и SQLAlchemy
        print("📚 Creating Course: Базы данных и SQLAlchemy...")
        course3 = Course(
            title="Базы данных и SQLAlchemy",
            description="Научитесь проектировать реляционные базы данных и работать с ними из Python с помощью ORM."
        )
        db.add(course3)
        db.commit()
        db.refresh(course3)

        t6 = create_test("Что такое Primary Key (первичный ключ)?", ["Уникальный идентификатор строки", "Имя таблицы", "Пароль к БД", "Связь между таблицами"], "Уникальный идентификатор строки")
        l6 = Lesson(
            title="Введение в реляционные БД",
            content="В реляционных базах данных информация хранится в виде таблиц со строками и колонками. Каждая таблица должна содержать уникальный идентификатор для каждой строки — первичный ключ (Primary Key).",
            course_id=course3.id,
            test_id=t6.id
        )

        db.add_all([l6])
        db.commit()

        print("🎉 Database seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}", file=sys.stderr)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
