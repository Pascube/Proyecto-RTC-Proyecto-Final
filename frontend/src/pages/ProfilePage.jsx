import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import reviewService from '../services/reviewService';
import MovieGrid from '../components/movies/MovieGrid';
import ReviewCard from '../components/reviews/ReviewCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiEdit2, FiCheck, FiX, FiBookmark, FiStar, FiUser } from 'react-icons/fi';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ username: user?.username || '', bio: user?.bio || '' });
  const [isSaving, setIsSaving] = useState(false);

  const [watchlist, setWatchlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  const [activeTab, setActiveTab] = useState('watchlist');

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const data = await userService.getWatchlist();
        setWatchlist(data);
      } catch {
        // silently fail
      } finally {
        setIsLoadingWatchlist(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const data = await reviewService.getMyReviews();
        setReviews(data.reviews || data.data || data);
      } catch {
        // silently fail
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchWatchlist();
    fetchReviews();
  }, []);

  const handleProfileSave = async () => {
    if (!profileForm.username.trim()) {
      toast.error('El nombre de usuario no puede estar vacío');
      return;
    }
    setIsSaving(true);
    try {
      const updated = await userService.updateProfile(user._id, profileForm);
      updateUser(updated);
      setEditMode(false);
      toast.success('Perfil actualizado');
    } catch (err) {
      toast.error(err.message || 'Error al actualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReviewUpdated = (updated) => {
    setReviews((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
  };

  const handleReviewDeleted = (id) => {
    setReviews((prev) => prev.filter((r) => r._id !== id));
  };

  const joinDate = user?.createdAt
    ? new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: 'long' }).format(new Date(user.createdAt))
    : '';

  return (
    <div className="profile-page">
      <div className="container">
        {/* Header del perfil */}
        <motion.div
          className="profile-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="profile-avatar">
            {user?.username?.charAt(0).toUpperCase()}
          </div>

          <div className="profile-info">
            {editMode ? (
              <div className="profile-edit-form">
                <input
                  className="form-input profile-edit__username"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                  placeholder="Nombre de usuario"
                />
                <textarea
                  className="form-input profile-edit__bio"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Cuéntanos algo sobre ti..."
                  rows={3}
                />
                <div className="profile-edit__actions">
                  <button className="btn btn-primary btn-sm" onClick={handleProfileSave} disabled={isSaving}>
                    <FiCheck /> {isSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setEditMode(false); setProfileForm({ username: user.username, bio: user.bio || '' }); }}>
                    <FiX /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="profile-info__top">
                  <h1 className="profile-username">{user?.username}</h1>
                  <button className="btn-ghost profile-edit-btn" onClick={() => setEditMode(true)}>
                    <FiEdit2 /> Editar perfil
                  </button>
                </div>
                <p className="profile-bio">{user?.bio || 'Sin descripción todavía.'}</p>
                <div className="profile-meta">
                  <span><FiUser /> Miembro desde {joinDate}</span>
                  {user?.role === 'admin' && <span className="profile-badge">Admin</span>}
                </div>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat__value">{reviews.length}</span>
              <span className="profile-stat__label">Reseñas</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat__value">{watchlist.length}</span>
              <span className="profile-stat__label">Watchlist</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('watchlist')}
          >
            <FiBookmark /> Watchlist ({watchlist.length})
          </button>
          <button
            className={`profile-tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <FiStar /> Mis reseñas ({reviews.length})
          </button>
        </div>

        {/* Contenido de tabs */}
        <div className="profile-tab-content">
          {activeTab === 'watchlist' && (
            isLoadingWatchlist ? (
              <LoadingSpinner />
            ) : watchlist.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon"><FiBookmark /></span>
                <h3>Tu watchlist está vacía</h3>
                <p>Añade películas desde el catálogo para verlas más tarde.</p>
              </div>
            ) : (
              <MovieGrid movies={watchlist} />
            )
          )}

          {activeTab === 'reviews' && (
            isLoadingReviews ? (
              <LoadingSpinner />
            ) : reviews.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon"><FiStar /></span>
                <h3>Aún no has publicado reseñas</h3>
                <p>Explora el catálogo y comparte tu opinión sobre las películas.</p>
              </div>
            ) : (
              <div className="profile-reviews-list">
                {reviews.map((r) => (
                  <ReviewCard
                    key={r._id}
                    review={r}
                    showMovie
                    onUpdated={handleReviewUpdated}
                    onDeleted={handleReviewDeleted}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
