const mongoose = require('mongoose');

const buildMongoCandidates = () => {
  const candidates = [
    process.env.MONGODB_URI,
    process.env.MONGODB_URI_FALLBACK,
    process.env.MONGODB_URI_LOCAL,
  ].filter(Boolean);

  if (process.env.NODE_ENV !== 'production') {
    candidates.push('mongodb://127.0.0.1:27017/cineclub');
  }

  return [...new Set(candidates)];
};

const connectDB = async () => {
  const candidates = buildMongoCandidates();

  if (!candidates.length) {
    console.error('❌ No hay URIs de MongoDB configuradas. Revisa .env.');
    process.exit(1);
  }

  let lastError = null;

  for (const uri of candidates) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️  Fallo MongoDB con URI ${uri.includes('mongodb+srv://') ? 'Atlas' : 'local'}: ${error.message}`);
    }
  }

  console.error(`❌ Error al conectar MongoDB: ${lastError?.message || 'desconocido'}`);
  process.exit(1);
};

module.exports = connectDB;
