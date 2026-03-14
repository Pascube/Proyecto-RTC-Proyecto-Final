import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSend } from 'react-icons/fi';
import StarRating from '../common/StarRating';
import { useAuth } from '../../context/AuthContext';
import './ReviewForm.css';

const ReviewForm = ({ onSubmit, isSubmitting = false }) => {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Por favor, selecciona una valoración.');
      return;
    }
    if (comment.trim().length < 10) {
      setError('El comentario debe tener al menos 10 caracteres.');
      return;
    }

    onSubmit({ rating, comment });
    setRating(0);
    setComment('');
  };

  if (!isAuthenticated) {
    return (
      <div className="review-form review-form--unauthenticated">
        <p>
          <Link to="/login">Inicia sesión</Link> o <Link to="/registro">crea una cuenta</Link> para escribir una reseña.
        </p>
      </div>
    );
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3 className="review-form__title">Escribe tu reseña</h3>

      <div className="review-form__rating">
        <span className="review-form__label">Tu valoración</span>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div className="review-form__field">
        <label className="review-form__label" htmlFor="review-comment">
          Comentario
        </label>
        <textarea
          id="review-comment"
          className="review-form__textarea"
          placeholder="¿Qué te pareció la película? Cuéntanos tus impresiones..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          maxLength={1000}
          required
        />
        <span className="review-form__char-count">{comment.length} / 1000</span>
      </div>

      {error && <p className="review-form__error">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        <FiSend />
        {isSubmitting ? 'Publicando...' : 'Publicar reseña'}
      </button>
    </form>
  );
};

export default ReviewForm;
