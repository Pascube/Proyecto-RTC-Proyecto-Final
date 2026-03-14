import api from './api';

const reviewService = {
  getReviewsByMovie: (movieId, params = {}) =>
    api.get(`/reviews/movie/${movieId}`, { params }),

  getMyReviews: () => api.get('/reviews/my-reviews'),

  createReview: (reviewData) => api.post('/reviews', reviewData),

  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),

  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

export default reviewService;
