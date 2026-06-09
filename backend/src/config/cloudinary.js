const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const posterStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'cineclub/posters',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 600, crop: 'fill' }],
  },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'cineclub/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'fill' }],
  },
});

const uploadPoster = multer({
  storage: posterStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // máximo 5MB
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // máximo 5MB
});

module.exports = { cloudinary, uploadPoster, uploadAvatar };
