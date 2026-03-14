import axios from 'axios';
import useGameStore from '../store/useGameStore';

const BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({ baseURL: BASE_URL });

// Interceptor: Automatically attach userId to every request
apiClient.interceptors.request.use((config) => {
  const userId = useGameStore.getState().userId;
  
  // If params exist, add userId to them. If not, create params object.
  config.params = { ...config.params, userId };
  
  // Note: For POST/PUT requests where userId might need to be in the URL path 
  // (like the Pomodoro endpoints), we handle that in the specific API calls below.
  return config;
});

export const taskApi = {
  getAll: (params) => apiClient.get('/v1/tasks', { params }),
  create: (data) => apiClient.post('/v1/tasks', data),
  update: (taskId, data) => apiClient.put(`/v1/tasks/${taskId}`, data),
  updateStatus: (taskId, status) => apiClient.put(`/v1/tasks/${taskId}/status`, null, { params: { status } }),
  complete: (taskId) => apiClient.post(`/v1/tasks/${taskId}/complete`),
  delete: (taskId) => apiClient.delete(`/v1/tasks/${taskId}`),
};

export const pomodoroApi = {
  // Fixed: The interceptor will automatically append ?userId=1 to these!
  start: () => apiClient.post('/pomodoro/start'),
  pause: () => apiClient.post('/pomodoro/pause'),
  resume: () => apiClient.post('/pomodoro/resume'),
  complete: () => apiClient.post('/pomodoro/complete'),
};

export const userApi = {
  // User profile lookup
  getProfile: (userId) => apiClient.get(`/users/${userId}`),
};