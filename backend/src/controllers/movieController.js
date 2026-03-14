const { validationResult } = require('express-validator');
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const { cloudinary } = require('../config/cloudinary');
const tmdbService = require('../services/tmdbService');

// GET /api/movies — Listar películas con búsqueda, filtros y paginación
const getMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      year,
      minRating,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (genre) {
      filter.genre = { $in: genre.split(',') };
    }

    if (year) {
      filter.year = Number(year);
    }

    if (minRating) {
      filter.averageRating = { $gte: Number(minRating) };
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [movies, total] = await Promise.all([
      Movie.find(filter).sort(sortOptions).skip(skip).limit(limitNum),
      Movie.countDocuments(filter),
    ]);

    res.json({
      movies,
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

// GET /api/movies/:id — Detalle de una película
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Película no encontrada.' });
    }
    res.json({ movie });
  } catch (error) {
    next(error);
  }
};

// POST /api/movies — Crear película (solo admin)
const createMovie = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Datos no válidos', errors: errors.array() });
    }

    const movie = await Movie.create(req.body);
    res.status(201).json({ movie });
  } catch (error) {
    next(error);
  }
};

// PUT /api/movies/:id — Actualizar película (solo admin)
const updateMovie = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Datos no válidos', errors: errors.array() });
    }

    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({ message: 'Película no encontrada.' });
    }

    res.json({ movie });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/movies/:id — Eliminar película (solo admin)
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Película no encontrada.' });
    }

    // Eliminar poster de Cloudinary si existe
    if (movie.posterPublicId) {
      await cloudinary.uploader.destroy(movie.posterPublicId);
    }

    // Eliminar reseñas asociadas
    await Review.deleteMany({ movie: movie._id });
    await movie.deleteOne();

    res.json({ message: 'Película eliminada correctamente.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/movies/:id/poster — Subir poster a Cloudinary (solo admin)
const uploadPoster = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Película no encontrada.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No se ha proporcionado ninguna imagen.' });
    }

    // Eliminar poster anterior si existe
    if (movie.posterPublicId) {
      await cloudinary.uploader.destroy(movie.posterPublicId);
    }

    movie.posterUrl = req.file.path;
    movie.posterPublicId = req.file.filename;
    await movie.save();

    res.json({ movie });
  } catch (error) {
    next(error);
  }
};

// GET /api/movies/stats — Estadísticas para el panel admin
const getStats = async (req, res, next) => {
  try {
    const [totalMovies, totalReviews, topRated, genreStats] = await Promise.all([
      Movie.countDocuments(),
      Review.countDocuments(),
      Movie.find().sort({ averageRating: -1 }).limit(5).select('title averageRating reviewCount posterUrl'),
      Movie.aggregate([
        { $unwind: '$genre' },
        { $group: { _id: '$genre', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({ totalMovies, totalReviews, topRated, genreStats });
  } catch (error) {
    next(error);
  }
};

// GET /api/movies/:id/extras — Reparto y tráiler desde TMDB
const getMovieExtras = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id).select('title year');
    if (!movie) {
      return res.status(404).json({ message: 'Película no encontrada.' });
    }
    const extras = await tmdbService.getMovieExtras(movie.title, movie.year);
    res.json(extras);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMovies, getMovieById, createMovie, updateMovie, deleteMovie, uploadPoster, getStats, getMovieExtras };
