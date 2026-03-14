import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useMovies from '../hooks/useMovies';
import MovieGrid from '../components/movies/MovieGrid';
import MovieFilters from '../components/movies/MovieFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import toast from 'react-hot-toast';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './MoviesPage.css';

const MoviesPage = () => {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user, updateUser } = useAuth();

  const { movies, pagination, isLoading, error, filters, updateFilters, goToPage, resetFilters } = useMovies({
    genre: searchParams.get('genre') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    order: searchParams.get('order') || 'desc',
  });

  // Actualizar filtro de género desde URL params
  useEffect(() => {
    const genre = searchParams.get('genre');
    if (genre) updateFilters({ genre });
  }, []); // eslint-disable-line

  const handleWatchlistToggle = async (movieId) => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para añadir películas a tu watchlist');
      return;
    }

    const isInWatchlist = user?.watchlist?.some(
      (m) => (typeof m === 'string' ? m : m._id) === movieId
    );

    try {
      if (isInWatchlist) {
        await userService.removeFromWatchlist(movieId);
        updateUser({ watchlist: user.watchlist.filter((m) => (typeof m === 'string' ? m : m._id) !== movieId) });
        toast.success('Película eliminada de tu watchlist');
      } else {
        await userService.addToWatchlist(movieId);
        updateUser({ watchlist: [...(user.watchlist || []), movieId] });
        toast.success('Película añadida a tu watchlist');
      }
    } catch (err) {
      toast.error(err.message || 'Error al actualizar watchlist');
    }
  };

  return (
    <div className="movies-page">
      <div className="container">
        <header className="movies-page__header">
          <h1 className="movies-page__title">Catálogo de Películas</h1>
          <p className="movies-page__subtitle">
            Descubre y valora las mejores películas de la historia del cine.
          </p>
        </header>

        <MovieFilters
          filters={filters}
          onFilterChange={updateFilters}
          onReset={resetFilters}
          totalResults={pagination?.total}
        />

        {isLoading ? (
          <LoadingSpinner fullPage />
        ) : error ? (
          <div className="empty-state">
            <span className="empty-state-icon">⚠️</span>
            <h3>Error al cargar películas</h3>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <MovieGrid movies={movies} onWatchlistToggle={handleWatchlistToggle} />

            {/* Paginación */}
            {pagination && pagination.totalPages > 1 && (
              <div className="movies-page__pagination">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <FiChevronLeft /> Anterior
                </button>

                <div className="movies-page__page-info">
                  <span>Página {pagination.page} de {pagination.totalPages}</span>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Siguiente <FiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
