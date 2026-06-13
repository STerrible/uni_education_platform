import { describe, expect, it } from 'vitest';
import { validateAuthForm } from './Login.jsx';

describe('validateAuthForm', () => {
  it('rejects short login', () => {
    expect(
      validateAuthForm({ username: 'ab', password: '123456', first_name: 'Ann' }, 'login'),
    ).toMatch(/Логин/);
  });

  it('rejects short password', () => {
    expect(
      validateAuthForm({ username: 'student', password: '123', first_name: 'Ann' }, 'login'),
    ).toMatch(/Пароль/);
  });

  it('requires first name for registration', () => {
    expect(
      validateAuthForm({ username: 'student', password: '123456', first_name: '' }, 'register'),
    ).toMatch(/имя/);
  });

  it('accepts valid login data', () => {
    expect(
      validateAuthForm({ username: 'student', password: '123456', first_name: '' }, 'login'),
    ).toBe('');
  });
});
