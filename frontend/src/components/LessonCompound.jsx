import { createContext, useContext } from 'react';
import { Link } from 'react-router-dom';

const LessonContext = createContext(null);

export function LessonProvider({ children, value }) {
  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>;
}

export function useLesson() {
  const context = useContext(LessonContext);
  if (!context) {
    throw new Error('useLesson must be used within LessonProvider');
  }
  return context;
}

export function LessonFrame({ children }) {
  return <div className="lesson-frame">{children}</div>;
}

export function LessonHeader() {
  const { lesson, courseId } = useLesson();
  if (!lesson) return null;

  return (
    <header className="lesson-page-header">
      <Link to={`/courses/${courseId}`} className="back-link">
        ← К программе курса
      </Link>
      <h1>{lesson.title}</h1>
    </header>
  );
}

export function LessonContent() {
  const { lesson } = useLesson();
  if (!lesson) return null;

  return (
    <article className="lesson-content-body">
      <div className="prose">
        {lesson.content.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}

export function LessonTestSection() {
  const { test, submittingTest, testResult, selectedAnswer, setSelectedAnswer, onSubmitAnswer } =
    useLesson();

  if (!test) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAnswer || submittingTest) return;
    onSubmitAnswer(selectedAnswer);
  };

  return (
    <section className="lesson-test-section">
      <div className="card test-card">
        <span className="eyebrow">Проверка знаний</span>
        <h3>{test.question}</h3>

        <form onSubmit={handleSubmit} className="test-form">
          <div className="options-list" role="radiogroup" aria-label="Варианты ответов">
            {test.options.map((option, idx) => {
              const optionId = `option-${idx}`;
              const isChecked = selectedAnswer === option;
              return (
                <label
                  key={idx}
                  htmlFor={optionId}
                  className={`option-item ${isChecked ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    id={optionId}
                    name="test-option"
                    value={option}
                    checked={isChecked}
                    disabled={submittingTest || testResult?.is_correct}
                    onChange={() => setSelectedAnswer(option)}
                  />
                  <span className="option-text">{option}</span>
                </label>
              );
            })}
          </div>

          {testResult && (
            <div
              className={`status test-feedback-alert ${testResult.is_correct ? 'success' : 'error'}`}
              role="alert"
              aria-live="polite"
            >
              {testResult.is_correct ? (
                <p>🎉 Верно! Вы можете продолжить обучение.</p>
              ) : (
                <div>
                  <p>❌ Неправильно. Попробуйте еще раз!</p>
                  {testResult.correct_answer && (
                    <p className="hint-text">
                      Правильный ответ был: <strong>{testResult.correct_answer}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {!testResult?.is_correct && (
            <button
              type="submit"
              className="primary submit-test-btn"
              disabled={!selectedAnswer || submittingTest}
            >
              {submittingTest ? 'Проверка…' : 'Отправить ответ'}
            </button>
          )}
        </form>
      </div>
    </section>
  );
}

export function LessonNavigation() {
  const { prevLessonId, nextLessonId, courseId } = useLesson();

  return (
    <nav className="lesson-navigation-footer" aria-label="Навигация по урокам">
      {prevLessonId ? (
        <Link to={`/lessons/${prevLessonId}`} className="secondary prev-lesson-btn">
          ← Предыдущий урок
        </Link>
      ) : (
        <span />
      )}

      {nextLessonId ? (
        <Link to={`/lessons/${nextLessonId}`} className="primary next-lesson-btn">
          Следующий урок →
        </Link>
      ) : (
        <Link to={`/courses/${courseId}`} className="secondary next-lesson-btn">
          Завершить курс
        </Link>
      )}
    </nav>
  );
}

// Compound namespace object
export const LessonDetail = {
  Provider: LessonProvider,
  Frame: LessonFrame,
  Header: LessonHeader,
  Content: LessonContent,
  TestSection: LessonTestSection,
  Navigation: LessonNavigation,
};
