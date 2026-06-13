import { useEffect, useMemo, useState } from 'react';
import CourseCard from '../components/CourseCard.jsx';
import { enrollCourse, fetchCourses, fetchMyCourses, getErrorMessage } from '../api/client';

export default function Courses({ authenticated }) {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(() => new Set());
  const [status, setStatus] = useState('Загрузка курсов…');

  useEffect(() => {
    let active = true;
    const loadCourses = async () => {
      try {
        const promises = [fetchCourses()];
        if (authenticated) {
          promises.push(fetchMyCourses());
        }
        const [allCourses, myCourses] = await Promise.all(promises);
        if (!active) return;

        setCourses(allCourses);
        if (myCourses) {
          const ids = new Set(myCourses.map((item) => item.course.id));
          setEnrolledIds(ids);
        }
        setStatus(allCourses.length ? '' : 'Курсы пока не добавлены');
      } catch (error) {
        if (active) setStatus(getErrorMessage(error));
      }
    };
    loadCourses();
    return () => {
      active = false;
    };
  }, [authenticated]);

  const sortedCourses = useMemo(
    () => [...courses].sort((a, b) => a.title.localeCompare(b.title, 'ru')),
    [courses],
  );

  const handleEnroll = async (courseId) => {
    if (!authenticated) {
      setStatus('Для записи на курс необходимо авторизоваться');
      return;
    }
    try {
      await enrollCourse(courseId);
      setEnrolledIds((current) => new Set(current).add(courseId));
      setStatus('Вы успешно записались на курс');
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  };

  return (
    <section className="panel">
      <h1>Каталог курсов</h1>
      {status && (
        <p role="status" className="status">
          {status}
        </p>
      )}
      <div className="cards">
        {sortedCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            enrolled={enrolledIds.has(course.id)}
            onEnroll={handleEnroll}
          />
        ))}
      </div>
    </section>
  );
}
