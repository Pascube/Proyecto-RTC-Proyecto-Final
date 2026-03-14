import { useMemo } from 'react';
import MovieCard from './MovieCard';
import { useAuth } from '../../context/AuthContext';
import './MovieGrid.css';

const MovieGrid = ({ movies = [], onWatchlistToggle }) => {
  const { user } = useAuth();

  const watchlistSet = useMemo(
    () => new Set(user?.watchlist?.map((m) => (typeof m === 'string' ? m : m._id)) || []),
    [user?.watchlist]
  );

  if (movies.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">🎬</span>
        <h3>No se encontraron películas</h3>
        <p>Prueba cambiando los filtros de búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard
          key={movie._id}
          movie={movie}
          isInWatchlist={watchlistSet.has(movie._id)}
          onWatchlistToggle={onWatchlistToggle}
        />
      ))}
    </div>
  );
};

export default MovieGrid;
