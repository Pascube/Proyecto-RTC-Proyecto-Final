const express = require('express');
const { body } = require('express-validator');
const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  uploadPoster,
  getStats,
  getMovieExtras,
} = require('../controllers/movieController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { uploadPoster: uploadPosterMiddleware } = require('../config/cloudinary');

const router = express.Router();

const movieValidation = [
  body('title').trim().notEmpty().withMessage('El título es obligatorio'),
  body('year').isInt({ min: 1888 }).withMessage('Año no válido'),
  body('genre').isArray({ min: 1 }).withMessage('Al menos un género es obligatorio'),
  body('director').trim().notEmpty().withMessage('El director es obligatorio'),
  body('synopsis').trim().isLength({ min: 20, max: 1000 }).withMessage('La sinopsis debe tener entre 20 y 1000 caracteres'),
  body('duration').isInt({ min: 1 }).withMessage('La duración debe ser mayor a 0'),
  body('language').trim().notEmpty().withMessage('El idioma es obligatorio'),
];

router.get('/', getMovies);
router.get('/stats', auth, isAdmin, getStats);
router.get('/:id/extras', getMovieExtras);
router.get('/:id', getMovieById);
router.post('/', auth, isAdmin, movieValidation, createMovie);
router.put('/:id', auth, isAdmin, movieValidation, updateMovie);
router.delete('/:id', auth, isAdmin, deleteMovie);
router.post('/:id/poster', auth, isAdmin, uploadPosterMiddleware.single('poster'), uploadPoster);

module.exports = router;
