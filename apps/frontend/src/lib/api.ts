import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth APIs
export const auth = {
  signup: (data: { name: string; email: string; password: string; role: 'PARTICIPANT' | 'ORGANIZER' }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// Competition APIs
export const competitions = {
  getAll: (params?: { search?: string; tags?: string }) =>
    api.get('/competitions', { params }),
  getOne: (id: string) =>
    api.get(`/competitions/${id}`),
  create: (data: {
    title: string;
    description: string;
    tags?: string[];
    capacity: number;
    regDeadline: string;
    startDate?: string;
  }) =>
    api.post('/competitions', data),
  getMyCompetitions: () =>
    api.get('/competitions/my-competitions'),
  register: (id: string, idempotencyKey?: string) =>
    api.post(
      `/competitions/${id}/register`,
      {},
      idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : {}
    ),
  getRegistrations: (id: string) =>
    api.get(`/competitions/${id}/registrations`),
};

// Registration APIs
export const registrations = {
  getMy: () =>
    api.get('/competitions/registrations/my'),
};

export default api;