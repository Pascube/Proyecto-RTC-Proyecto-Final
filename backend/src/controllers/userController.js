const User = require('../models/User');
const Movie = require('../models/Movie');

// GET /api/users/profile — Ver perfil propio
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'watchlist',
      'title posterUrl year genre averageRating'
    );
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/profile — Actualizar perfil
const updateProfile = async (req, res, next) => {
  try {
    const { username, bio, avatar } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (bio !== undefined) updates.bio = bio;
    if (avatar) updates.avatar = avatar;

    // Comprobar que el nuevo username no está en uso
    if (username) {
      const exists = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (exists) {
        return res.status(409).json({ message: 'Ese nombre de usuario ya está en uso.' });
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).populate('watchlist', 'title posterUrl year genre averageRating');

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/watchlist/:movieId — Añadir a watchlist
const addToWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Película no encontrada.' });
    }

    const user = await User.findById(req.user._id);

    if (user.watchlist.includes(movieId)) {
      return res.status(409).json({ message: 'La película ya está en tu watchlist.' });
    }

    user.watchlist.push(movieId);
    await user.save();

    res.json({ message: 'Película añadida a tu watchlist.', watchlist: user.watchlist });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/watchlist/:movieId — Quitar de watchlist
const removeFromWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { watchlist: movieId },
    });

    res.json({ message: 'Película eliminada de tu watchlist.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/users — Listar todos los usuarios (solo admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limitNum).select('-password'),
      User.countDocuments(),
    ]);

    res.json({ users, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id — Eliminar usuario (solo admin)
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta desde aquí.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, addToWatchlist, removeFromWatchlist, getAllUsers, deleteUser };
