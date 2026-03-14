require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Movie = require('../models/Movie');
const tmdbService = require('../services/tmdbService');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const updatePostersFromTMDB = async () => {
  if (!process.env.TMDB_API_KEY) {
    throw new Error('Falta TMDB_API_KEY en .env');
  }

  await connectDB();

  console.log('\n🎞️  Actualizando pósters con TMDB...\n');

  const movies = await Movie.find({}, 'title year posterUrl');

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const movie of movies) {
    try {
      const match = await tmdbService.searchMovie(movie.title, movie.year);

      if (!match?.posterUrl) {
        skipped++;
        console.log(`⏭️  Sin match TMDB: ${movie.title} (${movie.year})`);
        await wait(150);
        continue;
      }

      movie.posterUrl = match.posterUrl;
      await movie.save();

      updated++;
      console.log(`✅ ${movie.title} -> ${match.posterUrl}`);
    } catch (error) {
      failed++;
      console.log(`❌ Error en ${movie.title}: ${error.message}`);
    }

    // Evita pegar demasiado rápido a la API pública
    await wait(200);
  }

  console.log('\n📊 Resultado TMDB:');
  console.log(`   - Actualizadas: ${updated}`);
  console.log(`   - Sin coincidencia: ${skipped}`);
  console.log(`   - Fallidas: ${failed}\n`);

  await mongoose.connection.close();
};

updatePostersFromTMDB()
  .then(() => {
    console.log('✨ Proceso TMDB finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error general en TMDB:', error.message);
    process.exit(1);
  });
