const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      maxlength: [200, 'El título no puede superar los 200 caracteres'],
    },
    year: {
      type: Number,
      required: [true, 'El año es obligatorio'],
      min: [1888, 'Año no válido'],
      max: [new Date().getFullYear() + 2, 'Año no válido'],
    },
    genre: {
      type: [String],
      required: [true, 'El género es obligatorio'],
      enum: [
        'Acción',
        'Aventura',
        'Animación',
        'Comedia',
        'Crimen',
        'Documental',
        'Drama',
        'Fantasía',
        'Terror',
        'Musical',
        'Romance',
        'Ciencia Ficción',
        'Thriller',
        'Western',
      ],
    },
    director: {
      type: String,
      required: [true, 'El director es obligatorio'],
      trim: true,
    },
    synopsis: {
      type: String,
      required: [true, 'La sinopsis es obligatoria'],
      maxlength: [1000, 'La sinopsis no puede superar los 1000 caracteres'],
    },
    duration: {
      type: Number,
      required: [true, 'La duración es obligatoria'],
      min: [1, 'La duración debe ser mayor a 0 minutos'],
    },
    language: {
      type: String,
      required: [true, 'El idioma es obligatorio'],
      default: 'Inglés',
    },
    posterUrl: {
      type: String,
      default: '',
    },
    posterPublicId: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Evita que el campo `language` del documento actúe como language override del text index.
movieSchema.index(
  { title: 'text', director: 'text', synopsis: 'text' },
  { language_override: 'mongoTextLanguage' }
);
movieSchema.index({ genre: 1 });
movieSchema.index({ year: 1 });
movieSchema.index({ averageRating: -1 });

module.exports = mongoose.model('Movie', movieSchema);
