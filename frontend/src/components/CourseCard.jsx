import { memo } from 'react';

function CourseCard({ course, enrolled, onEnroll }) {
  return (
    <article className="card">
      <div>
        <p className="eyebrow">Курс #{course.id}</p>
        <h3>{course.title}</h3>
        <p>{course.description || 'Описание курса скоро появится.'}</p>
      </div>
      <button disabled={enrolled} onClick={() => onEnroll(course.id)}>
        {enrolled ? 'Вы записаны' : 'Записаться'}
      </button>
    </article>
  );
}

export default memo(CourseCard);
