import { useEffect, useState, startTransition } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCourseDetails, enrollCourse, fetchCourses, getErrorMessage } from '../api/client';
import { CourseDetail } from '../components/CourseDetailCompound';

export default function CourseDetails({ authenticated }) {
  const { courseId } = useParams();
  const numericId = parseInt(courseId, 10);

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingEnroll, setLoadingEnroll] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        // Attempt to load full course details (available only if enrolled)
        const data = await fetchCourseDetails(numericId);
        if (!active) return;
        setCourse(data.course);
        setLessons(data.lessons);
        setIsEnrolled(true);
      } catch (err) {
        if (!active) return;
        if (err?.response?.status === 403) {
          // Not enrolled yet. Fetch basic course info from the catalog
          setIsEnrolled(false);
          try {
            const catalog = await fetchCourses();
            if (!active) return;
            const basicInfo = catalog.find((c) => c.id === numericId);
            if (basicInfo) {
              setCourse(basicInfo);
            } else {
              setError('Курс не найден в каталоге');
            }
          } catch (catalogErr) {
            setError(getErrorMessage(catalogErr));
          }
        } else {
          setError(getErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [numericId]);

  const handleEnroll = async () => {
    if (!authenticated) {
      setError('Для записи на курс необходимо авторизоваться');
      return;
    }

    try {
      setLoadingEnroll(true);
      setError('');
      await enrollCourse(numericId);
      // Wait for state transition to reload full details
      startTransition(() => {
        setIsEnrolled(true);
      });
      // We manually fetch the data after enrollment
      const data = await fetchCourseDetails(numericId);
      setCourse(data.course);
      setLessons(data.lessons);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingEnroll(false);
    }
  };

  if (loading) {
    return (
      <section className="panel">
        <p className="status" role="status">
          Загрузка данных курса…
        </p>
      </section>
    );
  }

  if (error && !course) {
    return (
      <section className="panel narrow">
        <h1>Ошибка</h1>
        <p className="error" role="alert">
          {error}
        </p>
        <Link to="/courses" className="primary">
          Вернуться в каталог
        </Link>
      </section>
    );
  }

  return (
    <section className="panel">
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <CourseDetail.Provider
        value={{ course, lessons, isEnrolled, onEnroll: handleEnroll, loadingEnroll }}
      >
        <CourseDetail.Frame>
          <CourseDetail.Header />
          <CourseDetail.Lessons />
          <CourseDetail.PersonalTest />
        </CourseDetail.Frame>
      </CourseDetail.Provider>
    </section>
  );
}
