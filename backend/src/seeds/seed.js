require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Review = require('../models/Review');

// ─── Utilidades ───────────────────────────────────────────────────────────────

const readCSV = (filePath, separator = ';') =>
  new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });

// ─── Sembrar Usuarios ─────────────────────────────────────────────────────────

const seedUsers = async () => {
  const filePath = path.join(__dirname, 'usersData.csv');
  const rows = await readCSV(filePath);

  const users = [];
  for (const row of rows) {
    users.push({
      username: row.username.trim(),
      email: row.email.trim(),
      password: row.password.trim(),
      role: row.role.trim(),
      bio: row.bio ? row.bio.trim() : '',
    });
  }

  // Usar insertMany no funciona para el hash; creamos uno a uno
  const createdUsers = [];
  for (const userData of users) {
    const user = await User.create(userData);
    createdUsers.push(user);
    console.log(`  ✅ Usuario: ${user.username}`);
  }

  return createdUsers;
};

// ─── Sembrar Películas ────────────────────────────────────────────────────────

const seedMovies = async () => {
  const filePath = path.join(__dirname, 'moviesData.csv');
  const rows = await readCSV(filePath);

  const moviesData = rows.map((row) => ({
    title: row.title.trim(),
    year: parseInt(row.year, 10),
    genre: row.genre
      .trim()
      .split(',')
      .map((g) => g.trim()),
    director: row.director.trim(),
    synopsis: row.synopsis.trim(),
    duration: parseInt(row.duration, 10),
    language: row.language.trim(),
    posterUrl: row.posterUrl ? row.posterUrl.trim() : '',
  }));

  const movies = await Movie.insertMany(moviesData);
  console.log(`  ✅ ${movies.length} películas sembradas`);
  return movies;
};

// ─── Sembrar Reseñas ──────────────────────────────────────────────────────────

const seedReviews = async (users, movies) => {
  const filePath = path.join(__dirname, 'reviewsData.csv');
  const rows = await readCSV(filePath);

  // Crear mapas para búsqueda rápida
  const userMap = new Map(users.map((u) => [u.email, u._id]));
  const movieMap = new Map(movies.map((m) => [m.title, m._id]));

  let count = 0;
  let skipped = 0;

  for (const row of rows) {
    const userId = userMap.get(row.userEmail.trim());
    const movieId = movieMap.get(row.movieTitle.trim());

    if (!userId) {
      console.warn(`  ⚠️  Usuario no encontrado: ${row.userEmail}`);
      skipped++;
      continue;
    }

    if (!movieId) {
      console.warn(`  ⚠️  Película no encontrada: ${row.movieTitle}`);
      skipped++;
      continue;
    }

    try {
      await Review.create({
        user: userId,
        movie: movieId,
        rating: parseInt(row.rating, 10),
        comment: row.comment.trim(),
      });
      count++;
    } catch (err) {
      if (err.code === 11000) {
        skipped++;
      } else {
        console.error(`  ❌ Error en reseña: ${err.message}`);
        skipped++;
      }
    }
  }

  console.log(`  ✅ ${count} reseñas sembradas (${skipped} omitidas)`);
};

// ─── Ejecución principal ──────────────────────────────────────────────────────

const closeConnection = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada correctamente.');
  }
};

const seed = async () => {
  let exitCode = 0;

  try {
    await connectDB();

    console.log('\n🌱 Iniciando semilla de base de datos...\n');

    // Reiniciar la base para eliminar también índices antiguos incompatibles.
    console.log('🗑️  Reiniciando base de datos...');
    await mongoose.connection.dropDatabase();
    await Promise.all([User.syncIndexes(), Movie.syncIndexes(), Review.syncIndexes()]);
    console.log('  ✅ Base de datos reiniciada e índices sincronizados\n');

    console.log('👤 Sembrando usuarios...');
    const users = await seedUsers();
    console.log();

    console.log('🎬 Sembrando películas...');
    const movies = await seedMovies();
    console.log();

    console.log('⭐ Sembrando reseñas...');
    await seedReviews(users, movies);
    console.log();

    console.log('✨ ¡Semilla completada con éxito!');
    console.log(`   - ${users.length} usuarios`);
    console.log(`   - ${movies.length} películas`);
    const reviewCount = await Review.countDocuments();
    console.log(`   - ${reviewCount} reseñas\n`);
  } catch (error) {
    console.error('\n❌ Error durante la semilla:', error.message);
    exitCode = 1;
  } finally {
    try {
      await closeConnection();
    } catch (closeError) {
      console.error('❌ Error cerrando conexión:', closeError.message);
      exitCode = 1;
    }

    console.log(exitCode === 0 ? '✅ Proceso de semilla finalizado correctamente.' : '❌ Proceso de semilla finalizado con errores.');
    process.exit(exitCode);
  }
};

const shutdown = async (signal) => {
  console.warn(`\n⚠️  Señal ${signal} recibida. Cerrando proceso de semilla...`);
  try {
    await closeConnection();
  } finally {
    process.exit(130);
  }
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

seed();
