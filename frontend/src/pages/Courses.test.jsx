import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Courses from './Courses';
import * as client from '../api/client';

// Mock the API client methods
vi.mock('../api/client', () => {
  return {
    fetchCourses: vi.fn(),
    fetchMyCourses: vi.fn(),
    enrollCourse: vi.fn(),
    getErrorMessage: vi.fn((err) => err.message || 'Ошибка'),
  };
});

describe('Courses Catalog Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    client.fetchCourses.mockReturnValue(new Promise(() => {})); // never resolves
    render(
      <MemoryRouter>
        <Courses authenticated={false} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Загрузка курсов…');
  });

  it('renders courses list on success', async () => {
    const mockCourses = [
      { id: 1, title: 'Python Basics', description: 'Learn Python' },
      { id: 2, title: 'Web Development', description: 'HTML, CSS, JS' },
    ];
    client.fetchCourses.mockResolvedValue(mockCourses);

    render(
      <MemoryRouter>
        <Courses authenticated={false} />
      </MemoryRouter>,
    );

    // Wait for the courses to load and render
    await waitFor(() => {
      expect(screen.getByText('Python Basics')).toBeInTheDocument();
      expect(screen.getByText('Web Development')).toBeInTheDocument();
    });
  });

  it('handles enrollment for authenticated user', async () => {
    const mockCourses = [{ id: 1, title: 'Python Basics', description: 'Learn Python' }];
    client.fetchCourses.mockResolvedValue(mockCourses);
    client.fetchMyCourses.mockResolvedValue([]);
    client.enrollCourse.mockResolvedValue({ message: 'Success' });

    render(
      <MemoryRouter>
        <Courses authenticated={true} />
      </MemoryRouter>,
    );

    // Wait for button to appear
    const enrollBtn = await screen.findByRole('button', { name: 'Записаться' });
    expect(enrollBtn).toBeInTheDocument();

    fireEvent.click(enrollBtn);

    // Verify enroll API is called
    expect(client.enrollCourse).toHaveBeenCalledWith(1);

    // Wait for the status text and open button
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Вы успешно записались на курс');
    });
  });
});
