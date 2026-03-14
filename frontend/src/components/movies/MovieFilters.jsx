import { useState, useCallback } from 'react';
import { FiSearch, FiX, FiSliders } from 'react-icons/fi';
import useDebounce from '../../hooks/useDebounce';
import './MovieFilters.css';

const GENRES = [
  'Acción', 'Aventura', 'Animación', 'Comedia', 'Crimen',
  'Documental', 'Drama', 'Fantasía', 'Terror', 'Musical',
  'Romance', 'Ciencia Ficción', 'Thriller', 'Western',
];

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Más recientes' },
  { value: 'averageRating-desc', label: 'Mejor valoradas' },
  { value: 'year-desc', label: 'Más nuevas (año)' },
  { value: 'year-asc', label: 'Más antiguas (año)' },
  { value: 'title-asc', label: 'A–Z' },
  { value: 'title-desc', label: 'Z–A' },
];

const MovieFilters = ({ filters, onFilterChange, onReset, totalResults }) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 400);

  // Actualizar búsqueda cuando el debounce se resuelve
  useCallback(() => {
    onFilterChange({ search: debouncedSearch });
  }, [debouncedSearch]); // eslint-disable-line

  // Sincronizar búsqueda debounced con el hook padre
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (val === '') onFilterChange({ search: '' });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ search: searchInput });
  };

  const handleGenreClick = (genre) => {
    const current = filters.genre || '';
    onFilterChange({ genre: current === genre ? '' : genre });
  };

  const handleSortChange = (e) => {
    const [sortBy, order] = e.target.value.split('-');
    onFilterChange({ sortBy, order });
  };

  const handleReset = () => {
    setSearchInput('');
    onReset();
  };

  const currentSortValue = `${filters.sortBy || 'createdAt'}-${filters.order || 'desc'}`;
  const hasActiveFilters = filters.search || filters.genre || currentSortValue !== 'createdAt-desc';

  return (
    <div className="movie-filters">
      {/* Barra de búsqueda */}
      <form className="movie-filters__search" onSubmit={handleSearchSubmit}>
        <div className="movie-filters__search-wrap">
          <FiSearch className="movie-filters__search-icon" />
          <input
            type="search"
            placeholder="Buscar películas, directores..."
            value={searchInput}
            onChange={handleSearchChange}
            className="movie-filters__search-input"
          />
          {searchInput && (
            <button type="button" className="movie-filters__clear-btn" onClick={() => { setSearchInput(''); onFilterChange({ search: '' }); }}>
              <FiX />
            </button>
          )}
        </div>
      </form>

      {/* Controles secundarios */}
      <div className="movie-filters__controls">
        <button
          className={`btn btn-secondary btn-sm movie-filters__toggle-btn ${filtersOpen ? 'movie-filters__toggle-btn--active' : ''}`}
          onClick={() => setFiltersOpen((o) => !o)}
        >
          <FiSliders /> Filtros {hasActiveFilters && <span className="movie-filters__active-dot" />}
        </button>

        <select
          className="movie-filters__sort"
          value={currentSortValue}
          onChange={handleSortChange}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {totalResults !== undefined && (
          <span className="movie-filters__count text-muted text-sm">
            {totalResults} {totalResults === 1 ? 'película' : 'películas'}
          </span>
        )}

        {hasActiveFilters && (
          <button className="btn btn-ghost btn-sm" onClick={handleReset}>
            <FiX /> Limpiar
          </button>
        )}
      </div>

      {/* Panel de géneros */}
      {filtersOpen && (
        <div className="movie-filters__genres">
          <span className="movie-filters__genres-label">Género:</span>
          <div className="movie-filters__genres-list">
            {GENRES.map((genre) => (
              <button
                key={genre}
                className={`movie-filters__genre-btn ${filters.genre === genre ? 'movie-filters__genre-btn--active' : ''}`}
                onClick={() => handleGenreClick(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieFilters;
