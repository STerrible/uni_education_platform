import { createContext, useContext } from 'react';
import { Link } from 'react-router-dom';

const PersonalTestContext = createContext(null);

export function PersonalTestProvider({ children, value }) {
  return <PersonalTestContext.Provider value={value}>{children}</PersonalTestContext.Provider>;
}

export function usePersonalTest() {
  const context = useContext(PersonalTestContext);
  if (!context) {
    throw new Error('usePersonalTest must be used within PersonalTestProvider');
  }
  return context;
}

export function PersonalTestFrame({ children }) {
  return <div className="personal-test-frame">{children}</div>;
}

export function PersonalTestGenerator() {
  const { questionsCount, setQuestionsCount, generating, onGenerate, courseId } = usePersonalTest();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (generating) return;
    onGenerate();
  };

  return (
    <div className="personal-test-setup card">
      <Link to={`/courses/${courseId}`} className="back-link">
        ← Вернуться к курсу
      </Link>
      <h2>Настройка тестирования</h2>
      <p>
        Система автоматически проанализирует учебные материалы курса и составит индивидуальный набор
        проверочных вопросов.
      </p>

      <form onSubmit={handleSubmit} className="setup-form">
        <label htmlFor="questions-count-input">
          Количество вопросов в тесте:
          <input
            type="number"
            id="questions-count-input"
            min="1"
            max="15"
            value={questionsCount}
            disabled={generating}
            onChange={(e) =>
              setQuestionsCount(Math.min(15, Math.max(1, parseInt(e.target.value) || 5)))
            }
          />
        </label>

        <button type="submit" className="primary generate-btn" disabled={generating}>
          {generating ? 'Генерация вопросов…' : 'Сгенерировать тест'}
        </button>
      </form>
    </div>
  );
}

export function PersonalTestQuestions() {
  const { testData, answers, setAnswer, onSubmitTest, results, submitting } = usePersonalTest();

  if (!testData || results) return null;

  const allAnswered = testData.questions.every((_, idx) => answers[idx] !== undefined);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allAnswered || submitting) return;
    onSubmitTest();
  };

  return (
    <div className="personal-test-active">
      <h2>Контрольный тест</h2>
      <form onSubmit={handleSubmit} className="active-test-form">
        {testData.questions.map((question, qIdx) => (
          <div key={qIdx} className="card question-card">
            <span className="eyebrow">
              Вопрос {qIdx + 1} из {testData.questions.length}
            </span>
            <h3>{question.question}</h3>

            <div
              className="options-list"
              role="radiogroup"
              aria-label={`Варианты к вопросу ${qIdx + 1}`}
            >
              {question.options.map((option, oIdx) => {
                const optionId = `q-${qIdx}-opt-${oIdx}`;
                const isChecked = answers[qIdx] === option;
                return (
                  <label
                    key={oIdx}
                    htmlFor={optionId}
                    className={`option-item ${isChecked ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      id={optionId}
                      name={`question-${qIdx}`}
                      value={option}
                      checked={isChecked}
                      onChange={() => setAnswer(qIdx, option)}
                    />
                    <span className="option-text">{option}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <button
          type="submit"
          className="primary finish-test-btn"
          disabled={!allAnswered || submitting}
        >
          {submitting ? 'Обработка результатов…' : 'Завершить тест и проверить'}
        </button>
      </form>
    </div>
  );
}

export function PersonalTestResults() {
  const { results, onRetry, courseId, testData } = usePersonalTest();

  if (!results) return null;

  const scorePct = Math.round((results.score / results.total) * 100);

  return (
    <div className="personal-test-results card">
      <h2>Результаты тестирования</h2>
      <div className="score-summary-block">
        <div className="score-circle">
          <span className="score-value font-variant-numeric-tabular">
            {results.score} / {results.total}
          </span>
          <span className="score-pct font-variant-numeric-tabular">
            {scorePct}% правильных ответов
          </span>
        </div>
        <p className="score-text">
          {scorePct >= 80
            ? '🏆 Отличный результат! Вы превосходно усвоили материалы этого курса.'
            : scorePct >= 50
              ? '👍 Хороший результат, но некоторые темы стоит повторить.'
              : '📚 Рекомендуется повторно ознакомиться с учебными материалами.'}
        </p>
      </div>

      <div className="results-review">
        <h3>Детальный разбор ответов</h3>
        <div className="review-list">
          {testData.questions.map((question, idx) => {
            const userAnswer = results.detail[idx].userAnswer;
            const isCorrect = results.detail[idx].isCorrect;
            return (
              <div key={idx} className={`review-item-card ${isCorrect ? 'correct' : 'incorrect'}`}>
                <h4>
                  Вопрос {idx + 1}: {question.question}
                </h4>
                <p>
                  Ваш ответ:{' '}
                  <strong className={isCorrect ? 'text-success' : 'text-danger'}>
                    {userAnswer}
                  </strong>
                </p>
                {!isCorrect && (
                  <p>
                    Правильный ответ:{' '}
                    <strong className="text-success">{question.correct_answer}</strong>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="results-actions">
        <button onClick={onRetry} className="primary retry-btn">
          Пройти новый тест
        </button>
        <Link to={`/courses/${courseId}`} className="secondary return-btn">
          Вернуться к курсу
        </Link>
      </div>
    </div>
  );
}

// Compound namespace object
export const PersonalTestDetail = {
  Provider: PersonalTestProvider,
  Frame: PersonalTestFrame,
  Generator: PersonalTestGenerator,
  Questions: PersonalTestQuestions,
  Results: PersonalTestResults,
};
