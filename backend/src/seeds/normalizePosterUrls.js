require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Movie = require('../models/Movie');
const { cloudinary } = require('../config/cloudinary');

const buildPosterUrl = (publicId) =>
  cloudinary.url(publicId, {
    secure: true,
    format: 'jpg',
    transformation: [{ width: 400, height: 600, crop: 'fill' }],
  });

const normalizePosterUrls = async () => {
  await connectDB();

  console.log('\n🖼️  Normalizando URLs de póster a JPG...\n');

  const movies = await Movie.find({ posterPublicId: { $ne: '' } }, 'title posterPublicId posterUrl');

  let updated = 0;
  let skipped = 0;

  for (const movie of movies) {
    const nextUrl = buildPosterUrl(movie.posterPublicId);

    if (movie.posterUrl === nextUrl) {
      skipped++;
      continue;
    }

    movie.posterUrl = nextUrl;
    await movie.save();
    updated++;
    console.log(`✅ URL actualizada: ${movie.title}`);
  }

  console.log('\n📊 Resultado:');
  console.log(`   - Actualizadas: ${updated}`);
  console.log(`   - Sin cambios: ${skipped}\n`);

  await mongoose.connection.close();
};

normalizePosterUrls()
  .then(() => {
    console.log('✨ Normalización finalizada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en normalización:', error.message);
    process.exit(1);
  });
