import api from './api';

const userService = {
  getProfile: () => api.get('/users/profile'),

  updateProfile: (profileData) => {
    const isFormData = typeof FormData !== 'undefined' && profileData instanceof FormData;
    if (isFormData) {
      return api.put('/users/profile', profileData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put('/users/profile', profileData);
  },

  addToWatchlist: (movieId) => api.post(`/users/watchlist/${movieId}`),

  removeFromWatchlist: (movieId) => api.delete(`/users/watchlist/${movieId}`),

  getAllUsers: (params = {}) => api.get('/users', { params }),

  deleteUser: (id) => api.delete(`/users/${id}`),

  deleteCurrentUser: (id) => api.delete(`/users/${id}`),
};

export default userService;
