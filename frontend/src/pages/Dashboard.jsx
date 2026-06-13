import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyCourses, fetchTestHistory, getErrorMessage } from '../api/client';

export default function Dashboard({ authenticated }) {
  const [courses, setCourses] = useState([]);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!authenticated) return;
    Promise.all([fetchMyCourses(), fetchTestHistory()])
      .then(([myCourses, testHistory]) => {
        setCourses(myCourses);
        setHistory(testHistory);
      })
      .catch((error) => setStatus(getErrorMessage(error)));
  }, [authenticated]);

  const averageProgress = useMemo(() => {
    if (!courses.length) return 0;
    return Math.round(courses.reduce((sum, item) => sum + item.progress, 0) / courses.length);
  }, [courses]);

  if (!authenticated) {
    return (
      <section className="panel narrow">
        <h1>Личный кабинет</h1>
        <p>Войдите, чтобы увидеть свои курсы.</p>
        <Link to="/login" className="primary">
          Войти
        </Link>
      </section>
    );
  }

  return (
    <section className="panel">
      <h1>Личный кабинет</h1>
      {status && (
        <p role="alert" className="error">
          {status}
        </p>
      )}
      <div className="summary">
        <strong>{courses.length}</strong>
        <span>курсов в обучении</span>
        <strong>{averageProgress}%</strong>
        <span>средний прогресс</span>
      </div>
      <h2>Мои курсы</h2>
      <div className="cards">
        {courses.map(({ course, progress }) => (
          <article className="card" key={course.id}>
            <div>
              <h3>
                <Link to={`/courses/${course.id}`} className="course-link-title">
                  {course.title}
                </Link>
              </h3>
              <progress value={progress} max="100" />
              <p className="font-variant-numeric-tabular">{progress}% завершено</p>
            </div>
            <Link to={`/courses/${course.id}`} className="primary course-card-btn text-center">
              Продолжить обучение
            </Link>
          </article>
        ))}
      </div>
      <h2>История тестов</h2>
      <ul className="history">
        {history.map((item) => (
          <li key={`${item.test_id}-${item.submitted_at}`}>
            {item.question}: {item.is_correct ? 'верно' : 'нужно повторить'}
          </li>
        ))}
      </ul>
    </section>
  );
}
