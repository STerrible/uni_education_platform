import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">Фронтенд итогового проекта</p>
        <h1>Учебная платформа для курсов, уроков и тестирования</h1>
        <p>
          Приложение на React подключается к API FastAPI, поддерживает авторизацию,
          маршрутизацию, каталог курсов, личный кабинет и PWA-кэширование статики.
        </p>
        <div className="actions">
          <Link className="primary" to="/courses">Открыть каталог</Link>
          <Link className="secondary" to="/login">Авторизоваться</Link>
        </div>
      </div>
    </section>
  );
}
