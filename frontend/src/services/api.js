import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de petición: añadir token de autorización
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cineclub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: manejar errores globales
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cineclub_token');
      // El AuthContext detectará el cambio en el próximo ciclo
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
