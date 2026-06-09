const { validationResult } = require('express-validator');
const Review = require('../models/Review');
const Movie = require('../models/Movie');

// GET /api/reviews — Listar todas las reseñas
const getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find()
        .populate('user', 'username avatar')
        .populate('movie', 'title posterUrl year')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments(),
    ]);

    res.json({
      reviews,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/:id — Obtener reseña por ID
const getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'username avatar')
      .populate('movie', 'title posterUrl year');

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada.' });
    }

    res.json({ review });
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/movie/:movieId — Reseñas de una película
const getReviewsByMovie = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find({ movie: req.params.movieId })
        .populate('user', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments({ movie: req.params.movieId }),
    ]);

    res.json({
      reviews,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/user — Reseñas del usuario autenticado
const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('movie', 'title posterUrl year')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    next(error);
  }
};

// POST /api/reviews — Crear reseña
const createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Datos no válidos', errors: errors.array() });
    }

    const { movieId, rating, comment } = req.body;

    const movieExists = await Movie.findById(movieId);
    if (!movieExists) {
      return res.status(404).json({ message: 'Película no encontrada.' });
    }

    const existingReview = await Review.findOne({ user: req.user._id, movie: movieId });
    if (existingReview) {
      return res.status(409).json({ message: 'Ya has escrito una reseña para esta película.' });
    }

    const review = await Review.create({
      user: req.user._id,
      movie: movieId,
      rating,
      comment,
    });

    await review.populate('user', 'username avatar');

    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
};

// PUT /api/reviews/:id — Actualizar reseña (solo el autor)
const updateReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Datos no válidos', errors: errors.array() });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada.' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para editar esta reseña.' });
    }

    const { rating, comment } = req.body;
    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;
    await review.save();

    await review.populate('user', 'username avatar');

    res.json({ review });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/reviews/:id — Eliminar reseña (autor o admin)
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada.' });
    }

    const isAuthor = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta reseña.' });
    }

    await Review.findOneAndDelete({ _id: review._id });

    res.json({ message: 'Reseña eliminada correctamente.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReviews,
  getReviewById,
  getReviewsByMovie,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
};
