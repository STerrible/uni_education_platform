import { useState, startTransition } from 'react';
import { useParams } from 'react-router-dom';
import { generatePersonalTest, getErrorMessage } from '../api/client';
import { PersonalTestDetail } from '../components/PersonalTestCompound';

export default function PersonalTest() {
  const { courseId } = useParams();
  const numericCourseId = parseInt(courseId, 10);

  const [questionsCount, setQuestionsCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [testData, setTestData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError('');
      setTestData(null);
      setAnswers({});
      setResults(null);

      const data = await generatePersonalTest(numericCourseId, questionsCount);
      startTransition(() => {
        setTestData(data);
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleSetAnswer = (qIdx, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [qIdx]: answer,
    }));
  };

  const handleSubmitTest = () => {
    if (!testData || submitting) return;
    try {
      setSubmitting(true);
      setError('');

      let score = 0;
      const detail = testData.questions.map((question, idx) => {
        const userAnswer = answers[idx];
        const isCorrect =
          userAnswer?.trim().toLowerCase() === question.correct_answer?.trim().toLowerCase();
        if (isCorrect) score += 1;
        return {
          userAnswer,
          isCorrect,
        };
      });

      startTransition(() => {
        setResults({
          score,
          total: testData.questions.length,
          detail,
        });
      });
    } catch {
      setError('Не удалось обработать результаты теста');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    startTransition(() => {
      setTestData(null);
      setAnswers({});
      setResults(null);
      setError('');
    });
  };

  return (
    <section className="panel">
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <PersonalTestDetail.Provider
        value={{
          courseId: numericCourseId,
          questionsCount,
          setQuestionsCount,
          generating,
          testData,
          answers,
          setAnswer: handleSetAnswer,
          onSubmitTest: handleSubmitTest,
          results,
          submitting,
          onGenerate: handleGenerate,
          onRetry: handleRetry,
        }}
      >
        <PersonalTestDetail.Frame>
          {!testData && !results && <PersonalTestDetail.Generator />}
          {testData && !results && <PersonalTestDetail.Questions />}
          {results && <PersonalTestDetail.Results />}
        </PersonalTestDetail.Frame>
      </PersonalTestDetail.Provider>
    </section>
  );
}
