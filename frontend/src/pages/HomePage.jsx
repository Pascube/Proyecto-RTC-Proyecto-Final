import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiStar, FiFilm } from 'react-icons/fi';
import movieService from '../services/movieService';
import MovieCard from '../components/movies/MovieCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getProxiedImageUrl } from '../utils/imageProxy';
import './HomePage.css';

const HERO_GENRES = ['Thriller', 'Drama', 'Ciencia Ficción', 'Acción', 'Animación'];

// Para el hero usamos la imagen de TMDB en formato horizontal (w1280)
// sustituyendo w500 por w1280 en la URL del póster
const getHeroImageUrl = (posterUrl = '') => {
  if (!posterUrl) return null;
  // Siempre pasamos por el proxy (mismo origen = sin bloqueo CORS)
  // Para TMDB escalamos a w1280 para mejor resolución en el hero
  const url = posterUrl.includes('image.tmdb.org')
    ? posterUrl.replace('/w500/', '/w1280/')
    : posterUrl;
  return getProxiedImageUrl(url);
};

const HERO_FALLBACK_SVG = "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'><rect width='1200' height='800' fill='#0f172a'/><circle cx='220' cy='180' r='220' fill='%23c9a227' fill-opacity='0.12'/><circle cx='980' cy='620' r='260' fill='%23c9a227' fill-opacity='0.08'/><text x='600' y='390' text-anchor='middle' fill='%23e5e7eb' font-size='54' font-family='Arial, sans-serif'>CineClub</text></svg>";
const HERO_FALLBACK = `data:image/svg+xml;charset=UTF-8,${HERO_FALLBACK_SVG}`;

const HomePage = () => {
  const [topRated, setTopRated] = useState([]);
  const [recent, setRecent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const [topData, recentData] = await Promise.all([
          movieService.getMovies({ sortBy: 'averageRating', order: 'desc', limit: 5, minRating: 4 }),
          movieService.getMovies({ sortBy: 'createdAt', order: 'desc', limit: 10 }),
        ]);
        setTopRated(topData.movies);
        setRecent(recentData.movies);
      } finally {
        setIsLoading(false);
      }
    };
    loadMovies();
  }, []);

  const featuredMovie = useMemo(() => topRated[0], [topRated]);

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="home-page">
      {/* Hero */}
      {featuredMovie && (
        <section className="hero">
          <div className="hero__backdrop">
            {featuredMovie.posterUrl && (
              <img
                src={getHeroImageUrl(featuredMovie.posterUrl)}
                alt=""
                className="hero__backdrop-img"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
          </div>
          <div className="hero__overlay" />
          <div className="container hero__content">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="hero__badges">
                {featuredMovie.genre?.slice(0, 2).map((g) => (
                  <span key={g} className="badge badge-accent">{g}</span>
                ))}
              </div>
              <h1 className="hero__title">{featuredMovie.title}</h1>
              <p className="hero__year">{featuredMovie.year} · {featuredMovie.director}</p>
              <p className="hero__synopsis">{featuredMovie.synopsis?.substring(0, 180)}...</p>
              <div className="hero__rating">
                <FiStar className="hero__star" />
                <span>{featuredMovie.averageRating?.toFixed(1)}</span>
                <span className="hero__review-count">({featuredMovie.reviewCount} reseñas)</span>
              </div>
              <div className="hero__actions">
                <Link to={`/peliculas/${featuredMovie._id}`} className="btn btn-primary btn-lg">
                  Ver detalles <FiArrowRight />
                </Link>
                <Link to="/peliculas" className="btn btn-secondary btn-lg">
                  Explorar catálogo
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Géneros destacados */}
      <section className="home-section">
        <div className="container">
          <div className="home-section__header">
            <h2 className="home-section__title">Explora por género</h2>
          </div>
          <div className="genre-pills">
            {HERO_GENRES.map((genre) => (
              <Link key={genre} to={`/peliculas?genre=${encodeURIComponent(genre)}`} className="genre-pill">
                {genre}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top valoradas */}
      {topRated.length > 0 && (
        <section className="home-section">
          <div className="container">
            <div className="home-section__header">
              <h2 className="home-section__title">
                <FiStar className="text-gold" /> Mejor valoradas
              </h2>
              <Link to="/peliculas?sortBy=averageRating&order=desc" className="home-section__link">
                Ver todas <FiArrowRight />
              </Link>
            </div>
            <div className="home-movies-row">
              {topRated.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Añadidas recientemente */}
      {recent.length > 0 && (
        <section className="home-section">
          <div className="container">
            <div className="home-section__header">
              <h2 className="home-section__title">
                <FiFilm className="text-accent" /> Añadidas recientemente
              </h2>
              <Link to="/peliculas" className="home-section__link">
                Ver catálogo <FiArrowRight />
              </Link>
            </div>
            <div className="home-movies-row">
              {recent.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="home-cta">
        <div className="container">
          <motion.div
            className="home-cta__card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="home-cta__title">¿Eres cinéfilo?</h2>
            <p className="home-cta__subtitle">Únete a CineClub y comparte tus opiniones con miles de amantes del cine.</p>
            <Link to="/registro" className="btn btn-primary btn-lg">Crear cuenta gratis</Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
