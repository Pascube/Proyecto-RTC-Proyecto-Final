const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { uploadAvatar } = require('../config/cloudinary');

const router = express.Router();

router.post(
  '/register',
  uploadAvatar.single('image'),
  [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('El nombre debe tener entre 3 y 30 caracteres'),
    body('email').isEmail().normalizeEmail().withMessage('Email no válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email no válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  ],
  login
);

router.get('/me', auth, getMe);

module.exports = router;
