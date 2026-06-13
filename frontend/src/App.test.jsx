import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App.jsx';

describe('App routing', () => {
  it('renders home page on root route', async () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: /Учебная платформа/i })).toBeInTheDocument();
  });

  it('renders login route', async () => {
    render(<MemoryRouter initialEntries={['/login']}><App /></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: /Вход/i })).toBeInTheDocument();
  });
});
