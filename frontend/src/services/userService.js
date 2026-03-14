import api from './api';

const userService = {
  getProfile: () => api.get('/users/profile'),

  updateProfile: (profileData) => api.put('/users/profile', profileData),

  addToWatchlist: (movieId) => api.post(`/users/watchlist/${movieId}`),

  removeFromWatchlist: (movieId) => api.delete(`/users/watchlist/${movieId}`),

  getAllUsers: (params = {}) => api.get('/users', { params }),

  deleteUser: (id) => api.delete(`/users/${id}`),
};

export default userService;
