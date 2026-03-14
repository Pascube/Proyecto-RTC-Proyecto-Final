import api from './api';

const movieService = {
  getMovies: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    return api.get('/movies', { params: cleanParams });
  },

  getMovieById: (id) => api.get(`/movies/${id}`),

  createMovie: (movieData) => api.post('/movies', movieData),

  updateMovie: (id, movieData) => api.put(`/movies/${id}`, movieData),

  deleteMovie: (id) => api.delete(`/movies/${id}`),

  uploadPoster: (id, formData) =>
    api.post(`/movies/${id}/poster`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getStats: () => api.get('/movies/stats'),
};

export default movieService;
