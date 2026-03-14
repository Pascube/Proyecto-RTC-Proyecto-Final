import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import movieService from '../services/movieService';
import reviewService from '../services/reviewService';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/common/StarRating';
import ReviewCard from '../components/reviews/ReviewCard';
import ReviewForm from '../components/reviews/ReviewForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FiBookmark,
  FiCalendar,
  FiClock,
  FiGlobe,
  FiUser,
  FiStar,
  FiArrowLeft,
} from 'react-icons/fi';
import './MovieDetailPage.css';

const PLACEHOLDER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'>
    <rect width='400' height='600' fill='#1a1a2e'/>
    <rect x='20' y='20' width='360' height='560' rx='16' fill='none' stroke='#c9a227' stroke-opacity='0.45'/>
    <text x='200' y='286' text-anchor='middle' fill='#c9a227' font-size='22' font-family='Arial, sans-serif'>CineClub</text>
    <text x='200' y='320' text-anchor='middle' fill='#f0f0f0' font-size='18' font-family='Arial, sans-serif'>Sin Poster</text>
  </svg>`
)}`;
const BACKDROP_FALLBACK = 'https://placehold.co/1200x800/0d0d0d/c9a227?text=CineClub';
const getProxiedPoster = (url) => `/api/images/proxy?url=${encodeURIComponent(url)}`;

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, updateUser } = useAuth();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsPagination, setReviewsPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMovie = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await movieService.getMovieById(id);
      setMovie(data.movie || data);
    } catch (err) {
      setError(err.message || 'Error al cargar la película');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const loadReviews = useCallback(async (page = 1) => {
    try {
      const data = await reviewService.getReviewsByMovie(id, { page, limit: 10 });
      setReviews(data.reviews || data.data || []);
      setReviewsPagination(data.pagination || null);
    } catch {
      // silently fail
    }
  }, [id]);

  useEffect(() => {
    loadMovie();
  }, [loadMovie]);

  useEffect(() => {
    loadReviews(reviewsPage);
  }, [loadReviews, reviewsPage]);

  const isInWatchlist = user?.watchlist?.some(
    (m) => (typeof m === 'string' ? m : m._id) === id
  );

  const handleWatchlist = async () => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para usar la watchlist');
      return;
    }
    try {
      if (isInWatchlist) {
        await userService.removeFromWatchlist(id);
        updateUser({ watchlist: user.watchlist.filter((m) => (typeof m === 'string' ? m : m._id) !== id) });
        toast.success('Eliminado de tu watchlist');
      } else {
        await userService.addToWatchlist(id);
        updateUser({ watchlist: [...(user.watchlist || []), id] });
        toast.success('Añadido a tu watchlist');
      }
    } catch (err) {
      toast.error(err.message || 'Error al actualizar watchlist');
    }
  };

  const handleReviewCreated = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
    toast.success('Reseña publicada');
    // Refresh movie to get updated averageRating
    loadMovie();
  };

  const handleReviewUpdated = (updatedReview) => {
    setReviews((prev) => prev.map((r) => (r._id === updatedReview._id ? updatedReview : r)));
    loadMovie();
  };

  const handleReviewDeleted = (reviewId) => {
    setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    loadMovie();
  };

  const userHasReviewed = reviews.some(
    (r) => (r.user?._id || r.user) === user?._id
  );

  if (isLoading) return <LoadingSpinner fullPage />;

  if (error || !movie) {
    return (
      <div className="detail-error">
        <p>{error || 'Película no encontrada'}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/peliculas')}>
          Volver al catálogo
        </button>
      </div>
    );
  }

  const genres = Array.isArray(movie.genre) ? movie.genre : [movie.genre];

  return (
    <div className="movie-detail-page">
      {/* Banner de fondo */}
      {movie.posterUrl && (
        <div
          className="movie-detail__backdrop"
          style={{
            backgroundImage: `url(${getProxiedPoster(movie.posterUrl)}), url(${BACKDROP_FALLBACK})`,
          }}
        />
      )}

      <div className="container movie-detail__container">
        <button className="movie-detail__back btn-ghost" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Volver
        </button>

        <motion.div
          className="movie-detail__hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Póster */}
          <div className="movie-detail__poster-wrapper">
            <img
              src={movie.posterUrl ? getProxiedPoster(movie.posterUrl) : PLACEHOLDER}
              alt={movie.title}
              className="movie-detail__poster"
              onError={(e) => { e.target.src = PLACEHOLDER; }}
            />
          </div>

          {/* Info */}
          <div className="movie-detail__info">
            <h1 className="movie-detail__title">{movie.title}</h1>
            <div className="movie-detail__genres">
              {genres.map((g) => (
                <Link
                  key={g}
                  to={`/peliculas?genre=${encodeURIComponent(g)}`}
                  className="tag tag--genre"
                >
                  {g}
                </Link>
              ))}
            </div>

            <div className="movie-detail__meta">
              <span><FiCalendar /> {movie.year}</span>
              {movie.duration && <span><FiClock /> {movie.duration} min</span>}
              {movie.language && <span><FiGlobe /> {movie.language}</span>}
              {movie.director && <span><FiUser /> {movie.director}</span>}
            </div>

            <div className="movie-detail__rating">
              <StarRating value={movie.averageRating || 0} readOnly size="lg" showValue />
              <span className="movie-detail__review-count">
                {movie.reviewCount || 0} reseñas
              </span>
            </div>

            {movie.synopsis && (
              <p className="movie-detail__synopsis">{movie.synopsis}</p>
            )}

            <button
              className={`btn movie-detail__watchlist-btn ${isInWatchlist ? 'btn-primary' : 'btn-outline'}`}
              onClick={handleWatchlist}
            >
              <FiBookmark />
              {isInWatchlist ? 'En tu Watchlist' : 'Añadir a Watchlist'}
            </button>
          </div>
        </motion.div>

        {/* Sección de reseñas */}
        <section className="movie-detail__reviews">
          <h2 className="section-title">
            <FiStar /> Reseñas de la comunidad
          </h2>

          {isAuthenticated && !userHasReviewed && (
            <ReviewForm
              movieId={movie._id}
              onReviewCreated={handleReviewCreated}
            />
          )}

          {isAuthenticated && userHasReviewed && (
            <div className="info-banner">Ya has publicado una reseña para esta película.</div>
          )}

          {!isAuthenticated && (
            <div className="info-banner">
              <Link to="/login">Inicia sesión</Link> para publicar una reseña.
            </div>
          )}

          <AnimatePresence>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onUpdated={handleReviewUpdated}
                  onDeleted={handleReviewDeleted}
                />
              ))
            ) : (
              <motion.p className="no-reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Sé el primero en reseñar esta película.
              </motion.p>
            )}
          </AnimatePresence>

          {reviewsPagination && reviewsPagination.totalPages > 1 && (
            <div className="reviews__pagination">
              <button
                className="btn btn-secondary btn-sm"
                disabled={reviewsPage === 1}
                onClick={() => setReviewsPage((p) => p - 1)}
              >
                Anterior
              </button>
              <span>{reviewsPage} / {reviewsPagination.totalPages}</span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={reviewsPage === reviewsPagination.totalPages}
                onClick={() => setReviewsPage((p) => p + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MovieDetailPage;
