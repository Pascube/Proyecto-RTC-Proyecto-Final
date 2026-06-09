const express = require('express');
const {
  getProfile,
  updateProfile,
  addToWatchlist,
  removeFromWatchlist,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUser,
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { uploadAvatar } = require('../config/cloudinary');

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, uploadAvatar.single('image'), updateProfile);
router.post('/watchlist/:movieId', auth, addToWatchlist);
router.delete('/watchlist/:movieId', auth, removeFromWatchlist);
router.get('/', auth, isAdmin, getAllUsers);
router.get('/:id', auth, isAdmin, getUserById);
router.put('/:id', auth, isAdmin, uploadAvatar.single('image'), updateUserById);
router.delete('/:id', auth, deleteUser);

module.exports = router;
