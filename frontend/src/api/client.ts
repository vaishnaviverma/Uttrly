import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE,
});

export const promptAPI = {
  getRandomPrompt: () => apiClient.get('/prompts/random'),
  getAllPrompts: () => apiClient.get('/prompts'),
};

export const sessionAPI = {
  createSession: (data: FormData) =>
    apiClient.post('/sessions', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getSessions: () => apiClient.get('/sessions'),
  getSession: (id: string) => apiClient.get(`/sessions/${id}`),
  deleteSession: (id: string) => apiClient.delete(`/sessions/${id}`),
};

export default apiClient;
