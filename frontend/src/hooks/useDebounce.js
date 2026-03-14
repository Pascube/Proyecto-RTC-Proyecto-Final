import { useState, useEffect } from 'react';

/**
 * Hook personalizado que retrasa la actualización de un valor.
 * Útil para evitar demasiadas peticiones al API mientras el usuario escribe.
 *
 * @param {*} value - El valor a debouncer
 * @param {number} delay - Tiempo de espera en milisegundos (default: 400ms)
 * @returns El valor debounced
 */
const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
