const express = require('express');

const router = express.Router();

const ALLOWED_IMAGE_HOSTS = new Set([
  'res.cloudinary.com',
  'image.tmdb.org',
  'placehold.co',
  'via.placeholder.com',
]);

router.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ message: 'Falta el parámetro url.' });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({ message: 'URL no válida.' });
    }

    if (!ALLOWED_IMAGE_HOSTS.has(parsedUrl.hostname)) {
      return res.status(403).json({ message: 'Host de imagen no permitido.' });
    }

    const upstream = await fetch(parsedUrl.toString());

    if (!upstream.ok) {
      return res.status(502).json({ message: 'No se pudo obtener la imagen remota.' });
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';

    if (!contentType.startsWith('image/')) {
      return res.status(415).json({ message: 'El recurso remoto no es una imagen.' });
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: 'Error al proxificar imagen.', error: error.message });
  }
});

module.exports = router;