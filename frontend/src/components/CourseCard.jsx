import { memo } from 'react';
import { Link } from 'react-router-dom';

function CourseCard({ course, enrolled, onEnroll }) {
  return (
    <article className="card">
      <div>
        <p className="eyebrow">Курс #{course.id}</p>
        <h3>
          {enrolled ? (
            <Link to={`/courses/${course.id}`} className="course-link-title">
              {course.title}
            </Link>
          ) : (
            course.title
          )}
        </h3>
        <p>{course.description || 'Описание курса скоро появится…'}</p>
      </div>
      {enrolled ? (
        <Link to={`/courses/${course.id}`} className="primary course-card-btn text-center">
          Открыть курс
        </Link>
      ) : (
        <button className="primary course-card-btn" onClick={() => onEnroll(course.id)}>
          Записаться
        </button>
      )}
    </article>
  );
}

export default memo(CourseCard);
