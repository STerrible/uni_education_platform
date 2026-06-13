import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { clearToken, hasToken } from './api/client';

const Home = lazy(() => import('./pages/Home.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Courses = lazy(() => import('./pages/Courses.jsx'));
const CourseDetails = lazy(() => import('./pages/CourseDetails.jsx'));
const Lesson = lazy(() => import('./pages/Lesson.jsx'));
const PersonalTest = lazy(() => import('./pages/PersonalTest.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function Header({ authenticated, onLogout }) {
  return (
    <header className="app-header">
      <NavLink to="/" className="brand">
        Uni Education
      </NavLink>
      <nav aria-label="Основная навигация">
        <NavLink to="/courses">Каталог</NavLink>
        <NavLink to="/dashboard">Кабинет</NavLink>
        {authenticated ? (
          <button className="link-button" onClick={onLogout}>
            Выйти
          </button>
        ) : (
          <NavLink to="/login">Войти</NavLink>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(hasToken);
  const navigate = useNavigate();
  const handleLogin = useCallback(() => setAuthenticated(true), []);
  const handleLogout = useCallback(() => {
    clearToken();
    setAuthenticated(false);
    navigate('/login');
  }, [navigate]);
  const authContext = useMemo(
    () => ({ authenticated, onLogin: handleLogin }),
    [authenticated, handleLogin],
  );

  return (
    <div className="app-shell">
      <Header authenticated={authenticated} onLogout={handleLogout} />
      <main>
        <Suspense fallback={<p className="status">Загрузка раздела…</p>}>
          <Routes>
            <Route path="/" element={<Home authenticated={authenticated} />} />
            <Route path="/login" element={<Login auth={authContext} />} />
            <Route path="/courses" element={<Courses authenticated={authenticated} />} />
            <Route
              path="/courses/:courseId"
              element={<CourseDetails authenticated={authenticated} />}
            />
            <Route path="/lessons/:lessonId" element={<Lesson />} />
            <Route path="/personal-test/:courseId" element={<PersonalTest />} />
            <Route path="/dashboard" element={<Dashboard authenticated={authenticated} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
