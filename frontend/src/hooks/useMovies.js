import { useState, useEffect, useCallback, useRef } from 'react';
import movieService from '../services/movieService';

/**
 * Hook personalizado para gestionar la carga y filtrado de películas.
 * Centraliza la lógica de paginación, búsqueda y filtros.
 */
const useMovies = (initialFilters = {}) => {
  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    sortBy: 'createdAt',
    order: 'desc',
    page: 1,
    limit: 12,
    ...initialFilters,
  });

  // Ref para cancelar peticiones si el componente se desmonta
  const abortControllerRef = useRef(null);

  const fetchMovies = useCallback(async (currentFilters) => {
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const data = await movieService.getMovies(currentFilters);
      setMovies(data.movies);
      setPagination(data.pagination);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.message || 'Error al cargar las películas');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies(filters);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filters, fetchMovies]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const goToPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      genre: '',
      sortBy: 'createdAt',
      order: 'desc',
      page: 1,
      limit: 12,
    });
  }, []);

  return {
    movies,
    pagination,
    isLoading,
    error,
    filters,
    updateFilters,
    goToPage,
    resetFilters,
  };
};

export default useMovies;
