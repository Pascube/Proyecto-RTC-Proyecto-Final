const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Error de validación', errors: messages });
  }

  // Error de clave duplicada en MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      message: `Ya existe un registro con ese ${field === 'email' ? 'email' : field}.`,
    });
  }

  // Error de ObjectId no válido
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'ID no válido.' });
  }

  // Error genérico
  res.status(err.statusCode || 500).json({
    message: err.message || 'Error interno del servidor.',
  });
};

module.exports = errorHandler;
