import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import './AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  if (!isAuthLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email no válido';
    if (!form.password) e.password = 'La contraseña es obligatoria';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      toast.success('¡Bienvenido de nuevo!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-card__brand">
          <span className="brand-icon">🎬</span>
          <h1>CineClub</h1>
        </div>

        <h2 className="auth-card__title">Iniciar sesión</h2>
        <p className="auth-card__subtitle">Accede a tu cuenta para ver tu watchlist y reseñas</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className={`form-group ${errors.email ? 'form-group--error' : ''}`}>
            <label className="form-label" htmlFor="email">Email</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="form-input form-input--icon"
                placeholder="tu@email.com"
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* Contraseña */}
          <div className={`form-group ${errors.password ? 'form-group--error' : ''}`}>
            <label className="form-label" htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="form-input form-input--icon form-input--icon-right"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Mostrar contraseña"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="auth-card__footer">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="auth-link">Regístrate gratis</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
