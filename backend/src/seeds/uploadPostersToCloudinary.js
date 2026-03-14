require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Movie = require('../models/Movie');
const { cloudinary } = require('../config/cloudinary');

const isCloudinaryUrl = (url = '') => url.includes('res.cloudinary.com');

const migratePosters = async () => {
  await connectDB();

  console.log('\n☁️  Iniciando migración de pósters a Cloudinary...\n');

  const movies = await Movie.find({}, 'title posterUrl posterPublicId').lean();

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const movie of movies) {
    const sourceUrl = movie.posterUrl || '';

    if (!sourceUrl.trim()) {
      skipped++;
      console.log(`⏭️  Sin posterUrl: ${movie.title}`);
      continue;
    }

    if (isCloudinaryUrl(sourceUrl) && movie.posterPublicId) {
      skipped++;
      console.log(`⏭️  Ya migrada: ${movie.title}`);
      continue;
    }

    try {
      const result = await cloudinary.uploader.upload(sourceUrl, {
        folder: 'cineclub/posters',
        public_id: `movie_${movie._id}`,
        overwrite: true,
        resource_type: 'image',
      });

      await Movie.findByIdAndUpdate(movie._id, {
        posterUrl: result.secure_url,
        posterPublicId: result.public_id,
      });

      uploaded++;
      console.log(`✅ Migrada: ${movie.title}`);
    } catch (error) {
      failed++;
      console.log(`❌ Error en ${movie.title}: ${error.message}`);
    }
  }

  console.log('\n📊 Resultado migración:');
  console.log(`   - Subidas: ${uploaded}`);
  console.log(`   - Omitidas: ${skipped}`);
  console.log(`   - Fallidas: ${failed}\n`);

  await mongoose.connection.close();
};

migratePosters()
  .then(() => {
    console.log('✨ Migración de pósters finalizada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error general en la migración:', error.message);
    process.exit(1);
  });
