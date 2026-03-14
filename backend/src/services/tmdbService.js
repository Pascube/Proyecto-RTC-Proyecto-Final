const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const normalize = (text = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const scoreCandidate = (queryTitle, queryYear, candidate) => {
  const titleA = normalize(queryTitle);
  const titleB = normalize(candidate.title || candidate.original_title || '');

  let score = 0;

  if (titleA === titleB) {
    score += 100;
  } else if (titleB.includes(titleA) || titleA.includes(titleB)) {
    score += 70;
  }

  if (candidate.popularity) {
    score += Math.min(20, candidate.popularity / 10);
  }

  const releaseYear = candidate.release_date ? Number(candidate.release_date.slice(0, 4)) : null;
  if (queryYear && releaseYear) {
    const diff = Math.abs(Number(queryYear) - releaseYear);
    if (diff === 0) score += 30;
    else if (diff === 1) score += 15;
    else if (diff <= 3) score += 5;
  }

  if (!candidate.poster_path) {
    score -= 50;
  }

  return score;
};

const tmdbService = {
  async searchMovie(title, year) {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error('TMDB_API_KEY no está configurada.');
    }

    const searchUrl = new URL(`${TMDB_BASE_URL}/search/movie`);
    searchUrl.searchParams.set('api_key', apiKey);
    searchUrl.searchParams.set('query', title);
    searchUrl.searchParams.set('include_adult', 'false');
    searchUrl.searchParams.set('language', 'es-ES');
    if (year) {
      searchUrl.searchParams.set('year', String(year));
    }

    const response = await fetch(searchUrl.toString());
    if (!response.ok) {
      throw new Error(`TMDB respondió con ${response.status}`);
    }

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];

    if (results.length === 0) {
      return null;
    }

    const best = results
      .map((candidate) => ({
        candidate,
        score: scoreCandidate(title, year, candidate),
      }))
      .sort((a, b) => b.score - a.score)[0]?.candidate;

    if (!best || !best.poster_path) {
      return null;
    }

    return {
      tmdbId: best.id,
      title: best.title,
      posterPath: best.poster_path,
      posterUrl: `${TMDB_IMAGE_BASE_URL}/w500${best.poster_path}`,
      backdropUrl: best.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/w1280${best.backdrop_path}` : null,
      releaseDate: best.release_date || null,
    };
  },
};

module.exports = tmdbService;
