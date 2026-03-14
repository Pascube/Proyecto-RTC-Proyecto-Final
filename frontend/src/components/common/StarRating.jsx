import { useMemo } from 'react';
import { FiStar } from 'react-icons/fi';
import './StarRating.css';

/**
 * Componente de valoración por estrellas.
 * Puede ser solo de visualización (readOnly) o interactivo.
 */
const StarRating = ({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
  showValue = false,
}) => {
  const stars = useMemo(() => Array.from({ length: 5 }, (_, i) => i + 1), []);

  return (
    <div className={`star-rating star-rating--${size} ${readOnly ? 'star-rating--readonly' : ''}`}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          className={`star-rating__star ${star <= value ? 'star-rating__star--filled' : ''}`}
          onClick={() => !readOnly && onChange?.(star)}
          disabled={readOnly}
          aria-label={`${star} estrellas`}
        >
          <FiStar />
        </button>
      ))}
      {showValue && value > 0 && (
        <span className="star-rating__value">{value.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;
