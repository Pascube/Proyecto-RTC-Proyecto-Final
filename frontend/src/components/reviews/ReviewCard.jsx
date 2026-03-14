import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiEdit2, FiCheck, FiX, FiFilm } from 'react-icons/fi';
import StarRating from '../common/StarRating';
import { useAuth } from '../../context/AuthContext';
import './ReviewCard.css';

const ReviewCard = ({ review, onDelete, onUpdate, onUpdated, onDeleted, showMovie = false }) => {
  const { user, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editComment, setEditComment] = useState(review.comment);
  const [editRating, setEditRating] = useState(review.rating);

  const isAuthor = user?._id === review.user?._id || user?.id === review.user?._id;
  const canModify = isAuthor || isAdmin;

  const handleDelete = () => (onDeleted || onDelete)?.(review._id);

  const handleSaveEdit = () => {
    if (editComment.trim().length < 10) return;
    const cb = onUpdated || onUpdate;
    cb?.(review._id, { rating: editRating, comment: editComment });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditComment(review.comment);
    setEditRating(review.rating);
    setIsEditing(false);
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <motion.div
      className="review-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Película asociada (solo en perfil) */}
      {showMovie && review.movie && (
        <Link
          to={`/peliculas/${review.movie._id}`}
          className="review-card__movie-link"
        >
          <FiFilm />
          <span>{review.movie.title}</span>
          {review.movie.year && <span className="review-card__movie-year">({review.movie.year})</span>}
        </Link>
      )}
      {/* Cabecera */}
      <div className="review-card__header">
        <div className="review-card__user">
          <div className="review-card__avatar">
            {review.user?.avatar ? (
              <img src={review.user.avatar} alt={review.user.username} />
            ) : (
              <span>{review.user?.username?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <div>
            <span className="review-card__username">{review.user?.username}</span>
            <span className="review-card__date">{formatDate(review.createdAt)}</span>
          </div>
        </div>

        <div className="review-card__actions">
          {!isEditing && (
            <StarRating value={review.rating} readOnly size="sm" />
          )}
          {canModify && !isEditing && (
            <>
              {isAuthor && (
                <button className="review-card__action-btn" onClick={() => setIsEditing(true)} title="Editar">
                  <FiEdit2 />
                </button>
              )}
              <button className="review-card__action-btn review-card__action-btn--danger" onClick={handleDelete} title="Eliminar">
                <FiTrash2 />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cuerpo */}
      {isEditing ? (
        <div className="review-card__edit">
          <div className="review-card__edit-rating">
            <span className="text-sm text-secondary">Tu valoración:</span>
            <StarRating value={editRating} onChange={setEditRating} size="md" />
          </div>
          <textarea
            className="review-card__edit-textarea"
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            rows={4}
            maxLength={1000}
          />
          <div className="review-card__edit-actions">
            <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>
              <FiCheck /> Guardar
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>
              <FiX /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p className="review-card__comment">{review.comment}</p>
      )}
    </motion.div>
  );
};

export default ReviewCard;
