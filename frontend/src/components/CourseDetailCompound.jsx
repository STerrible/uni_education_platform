import { createContext, useContext } from 'react';
import { Link } from 'react-router-dom';

const CourseDetailContext = createContext(null);

export function CourseDetailProvider({ children, value }) {
  return <CourseDetailContext.Provider value={value}>{children}</CourseDetailContext.Provider>;
}

export function useCourseDetail() {
  const context = useContext(CourseDetailContext);
  if (!context) {
    throw new Error('useCourseDetail must be used within CourseDetailProvider');
  }
  return context;
}

export function CourseFrame({ children }) {
  return <div className="course-detail-frame">{children}</div>;
}

export function CourseHeader() {
  const { course, isEnrolled, onEnroll, loadingEnroll } = useCourseDetail();
  if (!course) return null;

  return (
    <header className="course-header-section">
      <div className="course-title-block">
        <p className="eyebrow">Курс #{course.id}</p>
        <h1 className="text-balance">{course.title}</h1>
        <p className="course-desc">{course.description || 'Описание курса скоро появится…'}</p>
      </div>
      <div className="course-actions-block">
        {!isEnrolled ? (
          <button className="primary enroll-btn" disabled={loadingEnroll} onClick={onEnroll}>
            {loadingEnroll ? 'Запись…' : 'Записаться на курс'}
          </button>
        ) : (
          <span className="badge success">Вы записаны</span>
        )}
      </div>
    </header>
  );
}

export function CourseLessons() {
  const { lessons, isEnrolled } = useCourseDetail();

  if (!isEnrolled) {
    return (
      <div className="status info">
        <p>Запишитесь на курс, чтобы получить доступ к учебным материалам.</p>
      </div>
    );
  }

  if (!lessons || lessons.length === 0) {
    return (
      <div className="status empty-state">
        <p>Материалы курса в данный момент готовятся к публикации…</p>
      </div>
    );
  }

  return (
    <div className="lessons-section">
      <h2>Содержание курса</h2>
      <div className="lessons-grid">
        {lessons.map((lesson, idx) => (
          <Link key={lesson.id} to={`/lessons/${lesson.id}`} className="lesson-item-card">
            <div className="lesson-num">Урок {idx + 1}</div>
            <div className="lesson-body">
              <h3>{lesson.title}</h3>
              {lesson.test_id && <span className="test-badge">Тест включён</span>}
            </div>
            <div className="lesson-arrow">→</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CoursePersonalTest() {
  const { course, isEnrolled, lessons } = useCourseDetail();

  if (!isEnrolled || !lessons || lessons.length === 0) return null;

  return (
    <div className="personal-test-cta-card">
      <div className="cta-content">
        <h3>Персональное тестирование</h3>
        <p>
          Сгенерируйте индивидуальный тест на основе пройденных уроков курса, чтобы проверить
          глубину своих знаний и выявить слабые места.
        </p>
      </div>
      <Link to={`/personal-test/${course.id}`} className="secondary generate-test-btn">
        Создать тест…
      </Link>
    </div>
  );
}

// Compound namespace object
export const CourseDetail = {
  Provider: CourseDetailProvider,
  Frame: CourseFrame,
  Header: CourseHeader,
  Lessons: CourseLessons,
  PersonalTest: CoursePersonalTest,
};
