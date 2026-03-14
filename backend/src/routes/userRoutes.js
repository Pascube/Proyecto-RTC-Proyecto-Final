const express = require('express');
const {
  getProfile,
  updateProfile,
  addToWatchlist,
  removeFromWatchlist,
  getAllUsers,
  deleteUser,
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/watchlist/:movieId', auth, addToWatchlist);
router.delete('/watchlist/:movieId', auth, removeFromWatchlist);
router.get('/', auth, isAdmin, getAllUsers);
router.delete('/:id', auth, isAdmin, deleteUser);

module.exports = router;
