import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import movieService from '../services/movieService';
import userService from '../services/userService';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StarRating from '../components/common/StarRating';
import {
  FiFilm,
  FiUsers,
  FiStar,
  FiTrendingUp,
  FiPlus,
  FiEdit2,
  FiTrash2,
} from 'react-icons/fi';
import './AdminPage.css';

const EMPTY_MOVIE_FORM = {
  title: '',
  year: '',
  genre: '',
  director: '',
  synopsis: '',
  duration: '',
  language: 'Español',
  posterUrl: '',
};

const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [moviesPage, setMoviesPage] = useState(1);
  const [moviesPagination, setMoviesPagination] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');
  const [isLoading, setIsLoading] = useState(true);

  // Modal de película
  const [movieModal, setMovieModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [movieForm, setMovieForm] = useState(EMPTY_MOVIE_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadStats();
    loadUsers();
  }, []);

  useEffect(() => {
    loadMovies(moviesPage);
  }, [moviesPage]);

  const loadStats = async () => {
    try {
      const data = await movieService.getStats();
      setStats(data);
    } catch {
      // silently fail
    }
  };

  const loadMovies = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await movieService.getMovies({ page, limit: 20, sortBy: 'createdAt', order: 'desc' });
      setMovies(data.movies || data.data || []);
      setMoviesPagination(data.pagination || null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch {
      // silently fail
    }
  };

  const openCreateModal = () => {
    setEditingMovie(null);
    setMovieForm(EMPTY_MOVIE_FORM);
    setMovieModal(true);
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    setMovieForm({
      title: movie.title || '',
      year: movie.year || '',
      genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || '',
      director: movie.director || '',
      synopsis: movie.synopsis || '',
      duration: movie.duration || '',
      language: movie.language || 'Español',
      posterUrl: movie.posterUrl || '',
    });
    setMovieModal(true);
  };

  const handleMovieSave = async () => {
    if (!movieForm.title.trim() || !movieForm.year) {
      toast.error('Título y año son obligatorios');
      return;
    }
    setIsSaving(true);
    const payload = {
      ...movieForm,
      year: Number(movieForm.year),
      duration: movieForm.duration ? Number(movieForm.duration) : undefined,
      genre: movieForm.genre.split(',').map((g) => g.trim()).filter(Boolean),
    };
    try {
      if (editingMovie) {
        const updated = await movieService.updateMovie(editingMovie._id, payload);
        setMovies((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
        toast.success('Película actualizada');
      } else {
        const created = await movieService.createMovie(payload);
        setMovies((prev) => [created, ...prev]);
        toast.success('Película creada');
      }
      setMovieModal(false);
    } catch (err) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('¿Eliminar esta película y todas sus reseñas?')) return;
    try {
      await movieService.deleteMovie(movieId);
      setMovies((prev) => prev.filter((m) => m._id !== movieId));
      toast.success('Película eliminada');
    } catch (err) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await userService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success('Usuario eliminado');
    } catch (err) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <header className="admin-header">
          <h1 className="admin-title">Panel de Administración</h1>
          <p className="admin-subtitle">Gestiona el contenido y usuarios de CineClub</p>
        </header>

        {/* Tabs */}
        <div className="admin-tabs">
          {[
            { id: 'stats', label: 'Estadísticas', icon: <FiTrendingUp /> },
            { id: 'movies', label: 'Películas', icon: <FiFilm /> },
            { id: 'users', label: 'Usuarios', icon: <FiUsers /> },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ESTADÍSTICAS */}
        {activeTab === 'stats' && (
          <div className="admin-stats">
            {!stats ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="stats-cards">
                  <motion.div className="stats-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <FiFilm className="stats-card__icon" />
                    <span className="stats-card__value">{stats.totalMovies ?? movies.length}</span>
                    <span className="stats-card__label">Películas</span>
                  </motion.div>
                  <motion.div className="stats-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <FiUsers className="stats-card__icon" />
                    <span className="stats-card__value">{users.length}</span>
                    <span className="stats-card__label">Usuarios</span>
                  </motion.div>
                  <motion.div className="stats-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <FiStar className="stats-card__icon" />
                    <span className="stats-card__value">{stats.totalReviews ?? '—'}</span>
                    <span className="stats-card__label">Reseñas</span>
                  </motion.div>
                </div>

                {stats.topRated?.length > 0 && (
                  <div className="stats-section">
                    <h3 className="stats-section__title">Top Películas Valoradas</h3>
                    <div className="stats-top-list">
                      {stats.topRated.slice(0, 5).map((m, i) => (
                        <div key={m._id} className="stats-top-item">
                          <span className="stats-rank">#{i + 1}</span>
                          <span className="stats-top-title">{m.title}</span>
                          <StarRating value={m.averageRating} readOnly size="sm" showValue />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {stats.genreStats?.length > 0 && (
                  <div className="stats-section">
                    <h3 className="stats-section__title">Películas por género</h3>
                    <div className="stats-genres">
                      {stats.genreStats.map((g) => (
                        <div key={g._id} className="stats-genre-item">
                          <span className="stats-genre-name">{g._id}</span>
                          <span className="stats-genre-count">{g.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* PELÍCULAS */}
        {activeTab === 'movies' && (
          <div className="admin-movies">
            <div className="admin-section-header">
              <h2>Gestión de Películas</h2>
              <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
                <FiPlus /> Nueva Película
              </button>
            </div>

            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Título</th>
                        <th>Año</th>
                        <th>Género</th>
                        <th>Rating</th>
                        <th>Reseñas</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movies.map((movie) => (
                        <tr key={movie._id}>
                          <td className="admin-table__title">{movie.title}</td>
                          <td>{movie.year}</td>
                          <td className="admin-table__genres">
                            {(Array.isArray(movie.genre) ? movie.genre : [movie.genre]).slice(0, 2).join(', ')}
                          </td>
                          <td>
                            <StarRating value={movie.averageRating || 0} readOnly size="sm" showValue />
                          </td>
                          <td>{movie.reviewCount || 0}</td>
                          <td>
                            <div className="admin-actions">
                              <button className="btn-icon" onClick={() => openEditModal(movie)} title="Editar">
                                <FiEdit2 />
                              </button>
                              <button className="btn-icon btn-icon--danger" onClick={() => handleDeleteMovie(movie._id)} title="Eliminar">
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {moviesPagination && moviesPagination.totalPages > 1 && (
                  <div className="admin-pagination">
                    <button className="btn btn-secondary btn-sm" disabled={moviesPage === 1} onClick={() => setMoviesPage((p) => p - 1)}>Anterior</button>
                    <span>{moviesPage} / {moviesPagination.totalPages}</span>
                    <button className="btn btn-secondary btn-sm" disabled={moviesPage === moviesPagination.totalPages} onClick={() => setMoviesPage((p) => p + 1)}>Siguiente</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* USUARIOS */}
        {activeTab === 'users' && (
          <div className="admin-users">
            <div className="admin-section-header">
              <h2>Gestión de Usuarios</h2>
              <span className="admin-count">{users.length} usuarios</span>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge role-badge--${u.role}`}>{u.role}</span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString('es-ES')}</td>
                      <td>
                        {u.role !== 'admin' && (
                          <button className="btn-icon btn-icon--danger" onClick={() => handleDeleteUser(u._id)} title="Eliminar">
                            <FiTrash2 />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de película */}
      <Modal
        isOpen={movieModal}
        onClose={() => setMovieModal(false)}
        title={editingMovie ? 'Editar Película' : 'Nueva Película'}
      >
        <div className="movie-form">
          {[
            { name: 'title', label: 'Título *', placeholder: 'El Padrino' },
            { name: 'year', label: 'Año *', placeholder: '1972', type: 'number' },
            { name: 'genre', label: 'Géneros (separados por coma)', placeholder: 'Drama, Crimen' },
            { name: 'director', label: 'Director', placeholder: 'Francis Ford Coppola' },
            { name: 'duration', label: 'Duración (min)', placeholder: '175', type: 'number' },
            { name: 'language', label: 'Idioma', placeholder: 'Inglés' },
            { name: 'posterUrl', label: 'URL del póster', placeholder: 'https://...' },
          ].map((field) => (
            <div key={field.name} className="form-group">
              <label className="form-label">{field.label}</label>
              <input
                className="form-input"
                type={field.type || 'text'}
                placeholder={field.placeholder}
                value={movieForm[field.name]}
                onChange={(e) => setMovieForm((p) => ({ ...p, [field.name]: e.target.value }))}
              />
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Sinopsis</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Sinopsis de la película..."
              value={movieForm.synopsis}
              onChange={(e) => setMovieForm((p) => ({ ...p, synopsis: e.target.value }))}
            />
          </div>
          <div className="movie-form__actions">
            <button className="btn btn-secondary" onClick={() => setMovieModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleMovieSave} disabled={isSaving}>
              {isSaving ? 'Guardando...' : editingMovie ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPage;
