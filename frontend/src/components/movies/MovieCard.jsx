import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiPlus, FiCheck } from 'react-icons/fi';
import { useCallback } from 'react';
import StarRating from '../common/StarRating';
import { useAuth } from '../../context/AuthContext';
import './MovieCard.css';

const getFallbackPoster = (title) => {
  const safeTitle = (title || 'Sin Poster').slice(0, 22);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'>
    <rect width='300' height='450' fill='#1a1a2e'/>
    <rect x='16' y='16' width='268' height='418' rx='12' fill='none' stroke='#c9a227' stroke-opacity='0.45'/>
    <text x='150' y='210' text-anchor='middle' fill='#c9a227' font-size='16' font-family='Arial, sans-serif'>CineClub</text>
    <text x='150' y='238' text-anchor='middle' fill='#f0f0f0' font-size='14' font-family='Arial, sans-serif'>${safeTitle}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getProxiedPoster = (url) =>
  `/api/images/proxy?url=${encodeURIComponent(url)}`;

const MovieCard = ({ movie, isInWatchlist = false, onWatchlistToggle }) => {
  const { isAuthenticated } = useAuth();

  const handleWatchlistClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      onWatchlistToggle?.(movie._id);
    },
    [movie._id, onWatchlistToggle]
  );

  return (
    <motion.div
      className="movie-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -6 }}
    >
      <Link to={`/peliculas/${movie._id}`} className="movie-card__link">
        {/* Poster */}
        <div className="movie-card__poster">
          <img
            src={movie.posterUrl ? getProxiedPoster(movie.posterUrl) : getFallbackPoster(movie.title)}
            alt={`Póster de ${movie.title}`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = getFallbackPoster(movie.title);
            }}
          />
          <div className="movie-card__overlay">
            <span className="movie-card__year">{movie.year}</span>
          </div>

          {/* Botón watchlist */}
          {isAuthenticated && (
            <button
              className={`movie-card__watchlist-btn ${isInWatchlist ? 'movie-card__watchlist-btn--active' : ''}`}
              onClick={handleWatchlistClick}
              title={isInWatchlist ? 'Quitar de watchlist' : 'Añadir a watchlist'}
            >
              {isInWatchlist ? <FiCheck /> : <FiPlus />}
            </button>
          )}
        </div>

        {/* Contenido */}
        <div className="movie-card__content">
          <h3 className="movie-card__title">{movie.title}</h3>

          <div className="movie-card__meta">
            <div className="movie-card__genres">
              {movie.genre?.slice(0, 2).map((g) => (
                <span key={g} className="badge">{g}</span>
              ))}
            </div>
          </div>

          <div className="movie-card__footer">
            <StarRating value={Math.round(movie.averageRating)} readOnly size="sm" />
            <span className="movie-card__rating-text">
              {movie.averageRating > 0 ? movie.averageRating.toFixed(1) : 'Sin valorar'}
            </span>
            {movie.duration && (
              <span className="movie-card__duration">
                <FiClock />
                {movie.duration} min
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MovieCard;
