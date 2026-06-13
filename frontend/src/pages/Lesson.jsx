import { useEffect, useState, startTransition } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  fetchLesson,
  fetchTest,
  submitTest,
  fetchCourseDetails,
  getErrorMessage,
} from '../api/client';
import { LessonDetail } from '../components/LessonCompound';

export default function Lesson() {
  const { lessonId } = useParams();
  const numericId = parseInt(lessonId, 10);

  const [lesson, setLesson] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [test, setTest] = useState(null);
  const [prevLessonId, setPrevLessonId] = useState(null);
  const [nextLessonId, setNextLessonId] = useState(null);

  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadLessonData = async () => {
      try {
        setLoading(true);
        setError('');
        setSelectedAnswer('');
        setTestResult(null);

        // Fetch lesson first to get the course_id and test_id
        const lessonData = await fetchLesson(numericId);
        if (!active) return;

        setLesson(lessonData);
        setCourseId(lessonData.course_id);

        // Run course details and test fetches in parallel to eliminate waterfalls
        const fetches = [fetchCourseDetails(lessonData.course_id)];
        if (lessonData.test_id) {
          fetches.push(fetchTest(lessonData.test_id));
        }

        const [courseDetails, testDetails] = await Promise.all(fetches);
        if (!active) return;

        if (testDetails) {
          setTest(testDetails);
        } else {
          setTest(null);
        }

        // Determine prev and next lessons
        const courseLessons = courseDetails.lessons || [];
        const currentIndex = courseLessons.findIndex((l) => l.id === numericId);
        if (currentIndex !== -1) {
          setPrevLessonId(currentIndex > 0 ? courseLessons[currentIndex - 1].id : null);
          setNextLessonId(
            currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1].id : null,
          );
        }
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadLessonData();

    return () => {
      active = false;
    };
  }, [numericId]);

  const handleSubmitAnswer = async (answer) => {
    if (!test || submittingTest) return;
    try {
      setSubmittingTest(true);
      setError('');
      const result = await submitTest(test.id, answer);
      startTransition(() => {
        setTestResult(result);
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmittingTest(false);
    }
  };

  if (loading) {
    return (
      <section className="panel">
        <p className="status" role="status">
          Загрузка урока…
        </p>
      </section>
    );
  }

  if (error && !lesson) {
    return (
      <section className="panel narrow">
        <h1>Ошибка</h1>
        <p className="error" role="alert">
          {error}
        </p>
        <Link to="/courses" className="primary">
          Вернуться к списку курсов
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

      <LessonDetail.Provider
        value={{
          lesson,
          courseId,
          test,
          submittingTest,
          testResult,
          selectedAnswer,
          setSelectedAnswer,
          onSubmitAnswer: handleSubmitAnswer,
          prevLessonId,
          nextLessonId,
        }}
      >
        <LessonDetail.Frame>
          <LessonDetail.Header />
          <LessonDetail.Content />
          <LessonDetail.TestSection />
          <LessonDetail.Navigation />
        </LessonDetail.Frame>
      </LessonDetail.Provider>
    </section>
  );
}
