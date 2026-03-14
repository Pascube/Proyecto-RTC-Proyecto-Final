import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import './AuthPages.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'El nombre de usuario es obligatorio';
    else if (form.username.length < 3) e.username = 'Mínimo 3 caracteres';
    if (!form.email.trim()) e.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email no válido';
    if (!form.password) e.password = 'La contraseña es obligatoria';
    else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (form.password !== form.confirm) e.confirm = 'Las contraseñas no coinciden';
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
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      toast.success('¡Cuenta creada! Bienvenido a CineClub');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Error al crear la cuenta');
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

        <h2 className="auth-card__title">Crear cuenta</h2>
        <p className="auth-card__subtitle">Únete a la comunidad cinéfila más apasionada</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div className={`form-group ${errors.username ? 'form-group--error' : ''}`}>
            <label className="form-label" htmlFor="username">Nombre de usuario</label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input
                id="username"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="form-input form-input--icon"
                placeholder="cinefilo123"
                autoComplete="username"
              />
            </div>
            {errors.username && <span className="form-error">{errors.username}</span>}
          </div>

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
                autoComplete="new-password"
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

          {/* Confirmar contraseña */}
          <div className={`form-group ${errors.confirm ? 'form-group--error' : ''}`}>
            <label className="form-label" htmlFor="confirm">Confirmar contraseña</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                className="form-input form-input--icon"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            {errors.confirm && <span className="form-error">{errors.confirm}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-card__footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="auth-link">Inicia sesión</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
