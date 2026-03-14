const express = require('express');
const { body } = require('express-validator');
const {
  getReviewsByMovie,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const auth = require('../middleware/auth');

const router = express.Router();

const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('La valoración debe ser entre 1 y 5'),
  body('comment').trim().isLength({ min: 10, max: 1000 }).withMessage('El comentario debe tener entre 10 y 1000 caracteres'),
];

router.get('/movie/:movieId', getReviewsByMovie);
router.get('/my-reviews', auth, getMyReviews);
router.post('/', auth, [...reviewValidation, body('movieId').notEmpty().withMessage('El ID de película es obligatorio')], createReview);
router.put('/:id', auth, reviewValidation, updateReview);
router.delete('/:id', auth, deleteReview);

module.exports = router;
