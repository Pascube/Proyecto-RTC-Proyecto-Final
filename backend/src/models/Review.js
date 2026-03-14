const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es obligatorio'],
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'La película es obligatoria'],
    },
    rating: {
      type: Number,
      required: [true, 'La valoración es obligatoria'],
      min: [1, 'La valoración mínima es 1'],
      max: [5, 'La valoración máxima es 5'],
    },
    comment: {
      type: String,
      required: [true, 'El comentario es obligatorio'],
      trim: true,
      minlength: [10, 'El comentario debe tener al menos 10 caracteres'],
      maxlength: [1000, 'El comentario no puede superar los 1000 caracteres'],
    },
  },
  {
    timestamps: true,
  }
);

// Un usuario solo puede dejar una reseña por película
reviewSchema.index({ user: 1, movie: 1 }, { unique: true });

// Método estático para recalcular el rating medio de una película
reviewSchema.statics.calcAverageRating = async function (movieId) {
  const Movie = require('./Movie');

  const stats = await this.aggregate([
    { $match: { movie: movieId } },
    {
      $group: {
        _id: '$movie',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Movie.findByIdAndUpdate(movieId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  } else {
    await Movie.findByIdAndUpdate(movieId, {
      averageRating: 0,
      reviewCount: 0,
    });
  }
};

// Recalcular rating tras guardar una reseña
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.movie);
});

// Recalcular rating tras eliminar una reseña
reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    doc.constructor.calcAverageRating(doc.movie);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
