import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage, loginUser, registerUser } from '../api/client';

const initialForm = { username: '', password: '', first_name: '', last_name: '' };

export function validateAuthForm(form, mode) {
  if (form.username.trim().length < 3) return 'Логин должен содержать минимум 3 символа';
  if (form.password.length < 6) return 'Пароль должен содержать минимум 6 символов';
  if (mode === 'register' && !form.first_name.trim()) return 'Укажите имя';
  return '';
}

export default function Login({ auth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const validationError = validateAuthForm(form, mode);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (mode === 'register') await registerUser(form);
      await loginUser(form);
      auth.onLogin();
      navigate('/dashboard');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel narrow">
      <h1>{mode === 'login' ? 'Вход' : 'Регистрация'}</h1>
      <form onSubmit={submit} noValidate>
        <label>Логин<input name="username" value={form.username} onChange={updateField} /></label>
        <label>Пароль<input name="password" type="password" value={form.password} onChange={updateField} /></label>
        {mode === 'register' && (
          <div className="grid two">
            <label>Имя<input name="first_name" value={form.first_name} onChange={updateField} /></label>
            <label>Фамилия<input name="last_name" value={form.last_name} onChange={updateField} /></label>
          </div>
        )}
        {error && <p role="alert" className="error">{error}</p>}
        <button className="primary" disabled={loading}>{loading ? 'Отправка...' : 'Продолжить'}</button>
      </form>
      <button className="link-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Создать аккаунт' : 'Уже есть аккаунт'}
      </button>
    </section>
  );
}
