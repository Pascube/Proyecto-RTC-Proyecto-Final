import api from './api';

const authService = {
  register: (userData) => api.post('/auth/register', userData),

  login: (credentials) => api.post('/auth/login', credentials),

  getMe: () => api.get('/auth/me'),
};

export default authService;
