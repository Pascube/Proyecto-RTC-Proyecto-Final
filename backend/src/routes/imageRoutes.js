const express = require('express');

const router = express.Router();

const ALLOWED_IMAGE_HOSTS = new Set([
  'res.cloudinary.com',
  'image.tmdb.org',
  'placehold.co',
  'via.placeholder.com',
]);

const buildFallbackSvg = (label = 'CineClub') => {
  const safeLabel = String(label).slice(0, 32);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
  <rect width="300" height="450" fill="#111827"/>
  <rect x="14" y="14" width="272" height="422" rx="12" fill="none" stroke="#c9a227" stroke-opacity="0.5"/>
  <text x="150" y="214" text-anchor="middle" fill="#c9a227" font-size="18" font-family="Arial, sans-serif">CineClub</text>
  <text x="150" y="242" text-anchor="middle" fill="#f3f4f6" font-size="14" font-family="Arial, sans-serif">${safeLabel}</text>
</svg>`;
};

const sendFallbackImage = (res, label) => {
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(buildFallbackSvg(label));
};

router.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return sendFallbackImage(res, 'Sin URL');
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return sendFallbackImage(res, 'URL no valida');
    }

    if (!ALLOWED_IMAGE_HOSTS.has(parsedUrl.hostname)) {
      return sendFallbackImage(res, 'Host no permitido');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    let upstream;

    try {
      upstream = await fetch(parsedUrl.toString(), { signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }

    if (!upstream.ok) {
      return sendFallbackImage(res, 'Poster no disponible');
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';

    if (!contentType.startsWith('image/')) {
      return sendFallbackImage(res, 'Recurso invalido');
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(buffer);
  } catch (error) {
    return sendFallbackImage(res, 'Error de red');
  }
});

module.exports = router;