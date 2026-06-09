import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import reviewService from '../services/reviewService';
import MovieGrid from '../components/movies/MovieGrid';
import ReviewCard from '../components/reviews/ReviewCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { FiEdit2, FiCheck, FiX, FiBookmark, FiStar, FiUser, FiCamera, FiLock, FiTrash2 } from 'react-icons/fi';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [watchlist, setWatchlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  const [activeTab, setActiveTab] = useState('watchlist');

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const data = await userService.getProfile();
        setWatchlist(data.user?.watchlist || data.watchlist || []);
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

  useEffect(() => {
    setProfileForm((prev) => ({
      ...prev,
      username: user?.username || '',
      bio: user?.bio || '',
    }));
  }, [user?.username, user?.bio]);

  const handleProfileSave = async () => {
    if (!profileForm.username.trim()) {
      toast.error('El nombre de usuario no puede estar vacío');
      return;
    }
    if (profileForm.newPassword && profileForm.newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (profileForm.newPassword && !profileForm.currentPassword) {
      toast.error('Debes indicar tu contraseña actual para cambiarla');
      return;
    }
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error('La confirmación de contraseña no coincide');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('username', profileForm.username.trim());
      formData.append('bio', profileForm.bio || '');

      if (profileForm.currentPassword) {
        formData.append('currentPassword', profileForm.currentPassword);
      }
      if (profileForm.newPassword) {
        formData.append('newPassword', profileForm.newPassword);
      }
      if (avatarFile) {
        formData.append('image', avatarFile);
      }

      const updated = await userService.updateProfile(formData);
      updateUser(updated.user || updated);
      setEditMode(false);
      setAvatarFile(null);
      setAvatarPreview('');
      setProfileForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
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

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecciona un archivo de imagen válido');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result?.toString() || '');
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = async () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAccount = async () => {
    if (!user?._id) return;

    setIsDeletingAccount(true);
    try {
      await userService.deleteCurrentUser(user._id);
      setIsDeleteModalOpen(false);
      logout();
      toast.success('Tu cuenta ha sido eliminada');
    } catch (err) {
      toast.error(err.message || 'No se pudo eliminar la cuenta');
    } finally {
      setIsDeletingAccount(false);
    }
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
            {(avatarPreview || user?.avatar) ? (
              <img src={avatarPreview || user?.avatar} alt="Avatar de usuario" className="profile-avatar__image" />
            ) : (
              user?.username?.charAt(0).toUpperCase()
            )}
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
                <div className="profile-edit__avatar">
                  <label className="profile-edit__avatar-label" htmlFor="avatar-input">
                    <FiCamera /> Cambiar avatar
                  </label>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="profile-edit__avatar-input"
                  />
                </div>
                <textarea
                  className="form-input profile-edit__bio"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Cuéntanos algo sobre ti..."
                  rows={3}
                />
                <div className="profile-edit__passwords">
                  <h3><FiLock /> Seguridad</h3>
                  <input
                    type="password"
                    className="form-input"
                    value={profileForm.currentPassword}
                    placeholder="Contraseña actual"
                    onChange={(e) => setProfileForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  />
                  <input
                    type="password"
                    className="form-input"
                    value={profileForm.newPassword}
                    placeholder="Nueva contraseña"
                    onChange={(e) => setProfileForm((p) => ({ ...p, newPassword: e.target.value }))}
                  />
                  <input
                    type="password"
                    className="form-input"
                    value={profileForm.confirmPassword}
                    placeholder="Confirmar nueva contraseña"
                    onChange={(e) => setProfileForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  />
                </div>
                <div className="profile-edit__actions">
                  <button className="btn btn-primary btn-sm" onClick={handleProfileSave} disabled={isSaving}>
                    <FiCheck /> {isSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditMode(false);
                      setAvatarFile(null);
                      setAvatarPreview('');
                      setProfileForm({
                        username: user.username,
                        bio: user.bio || '',
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                  >
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
                <button
                  className="btn-ghost profile-delete-btn"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                >
                  <FiTrash2 /> {isDeletingAccount ? 'Eliminando...' : 'Eliminar mi cuenta'}
                </button>
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

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Eliminar cuenta" size="sm">
        <p className="profile-confirm-description">Esta acción eliminará tu cuenta y no se puede deshacer.</p>
        <div className="profile-confirm-actions">
          <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeletingAccount}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={confirmDeleteAccount} disabled={isDeletingAccount}>
            {isDeletingAccount ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
