const User = require('../models/User');
const Movie = require('../models/Movie');
const { cloudinary } = require('../config/cloudinary');

const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete user.password;
  return user;
};

// GET /api/users/profile — Ver perfil propio
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'watchlist',
      'title posterUrl year genre averageRating'
    );
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/profile — Actualizar perfil
const updateProfile = async (req, res, next) => {
  try {
    const { username, bio, avatar, currentPassword, newPassword } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (bio !== undefined) updates.bio = bio;
    if (avatar) {
      updates.avatar = avatar;
      updates.image = avatar;
    }

    // Comprobar que el nuevo username no está en uso
    if (username) {
      const exists = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (exists) {
        return res.status(409).json({ message: 'Ese nombre de usuario ya está en uso.' });
      }
    }

    const userDoc = await User.findById(req.user._id).select('+password');
    if (!userDoc) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Debes indicar tu contraseña actual para cambiarla.' });
      }

      const isMatch = await userDoc.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'La contraseña actual no es correcta.' });
      }

      userDoc.password = newPassword;
    }

    if (req.file) {
      if (userDoc.avatarPublicId) {
        await cloudinary.uploader.destroy(userDoc.avatarPublicId);
      }
      userDoc.avatar = req.file.path;
      userDoc.avatarPublicId = req.file.filename;
      userDoc.image = req.file.path;
      userDoc.imagePublicId = req.file.filename;
    }

    Object.assign(userDoc, updates);
    await userDoc.save();

    const user = await User.findById(req.user._id).populate(
      'watchlist',
      'title posterUrl year genre averageRating'
    );

    res.json({ user: sanitizeUser(user) });
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

    const alreadyInWatchlist = user.watchlist.some((id) => id.toString() === movieId);
    if (alreadyInWatchlist) {
      return res.status(409).json({ message: 'La película ya está en tu watchlist.' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { watchlist: movieId },
    }, { new: true }).select('watchlist');

    res.json({ message: 'Película añadida a tu watchlist.', watchlist: updatedUser.watchlist });
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

// GET /api/users/:id — Obtener usuario por ID (solo admin)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('watchlist', 'title posterUrl year genre averageRating');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id — Actualizar usuario por ID (solo admin)
const updateUserById = async (req, res, next) => {
  try {
    const { username, email, role, bio, avatar, newPassword } = req.body;
    const user = await User.findById(req.params.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username, _id: { $ne: req.params.id } });
      if (usernameExists) {
        return res.status(409).json({ message: 'Ese nombre de usuario ya está en uso.' });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (emailExists) {
        return res.status(409).json({ message: 'Ese email ya está en uso.' });
      }
      user.email = email;
    }

    if (role) user.role = role;
    if (bio !== undefined) user.bio = bio;
    if (avatar) {
      user.avatar = avatar;
      user.image = avatar;
    }
    if (newPassword) user.password = newPassword;

    if (req.file) {
      if (user.avatarPublicId) {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      }
      user.avatar = req.file.path;
      user.avatarPublicId = req.file.filename;
      user.image = req.file.path;
      user.imagePublicId = req.file.filename;
    }

    await user.save();

    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('watchlist', 'title posterUrl year genre averageRating');

    res.json({ user: sanitizeUser(updatedUser) });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id — Eliminar usuario (solo admin)
const deleteUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const isSelfDelete = targetUserId === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSelfDelete && !isAdmin) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta cuenta.' });
    }

    const user = await User.findByIdAndDelete(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  addToWatchlist,
  removeFromWatchlist,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUser,
};
