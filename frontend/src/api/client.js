import axios from 'axios';

export const TOKEN_KEY = 'uni_edu_access_token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const hasToken = () => Boolean(localStorage.getItem(TOKEN_KEY));

export function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join(', ');
  return detail || error?.message || 'Не удалось выполнить запрос';
}

export async function loginUser(credentials) {
  const form = new URLSearchParams();
  form.set('username', credentials.username);
  form.set('password', credentials.password);
  const { data } = await api.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  setToken(data.access_token);
  return data;
}

export async function registerUser(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export const fetchCourses = async () => (await api.get('/student/courses')).data;
export const fetchMyCourses = async () => (await api.get('/student/my-courses')).data;
export const fetchCourseDetails = async (courseId) =>
  (await api.get(`/student/courses/${courseId}`)).data;
export const enrollCourse = async (courseId) =>
  (await api.post(`/student/courses/${courseId}/enroll`)).data;
export const fetchTestHistory = async () => (await api.get('/student/test-history')).data;
export const fetchLesson = async (lessonId) => (await api.get(`/student/lessons/${lessonId}`)).data;
export const fetchTest = async (testId) => (await api.get(`/student/tests/${testId}`)).data;
export const submitTest = async (testId, answer) =>
  (await api.post(`/student/tests/${testId}/submit`, { answer })).data;
export const generatePersonalTest = async (courseId, questionsCount) =>
  (
    await api.post('/student/personal-tests/generate', {
      course_id: courseId,
      questions_count: questionsCount,
    })
  ).data;
