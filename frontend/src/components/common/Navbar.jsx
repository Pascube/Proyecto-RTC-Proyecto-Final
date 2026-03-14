import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilm, FiUser, FiLogOut, FiMenu, FiX, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" onClick={closeMenu}>
          <FiFilm className="navbar__logo-icon" />
          <span className="navbar__logo-text">CineClub</span>
        </Link>

        {/* Navegación desktop */}
        <nav className="navbar__nav">
          <NavLink to="/peliculas" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            Películas
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `navbar__link navbar__link--admin ${isActive ? 'navbar__link--active' : ''}`}>
              <FiShield /> Admin
            </NavLink>
          )}
        </nav>

        {/* Acciones desktop */}
        <div className="navbar__actions">
          {isAuthenticated ? (
            <div className="navbar__user-menu">
              <Link to="/perfil" className="navbar__user-btn">
                <div className="navbar__avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    <span>{user?.username?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <span className="navbar__username">{user?.username}</span>
              </Link>
              <button className="navbar__logout-btn" onClick={handleLogout} title="Cerrar sesión">
                <FiLogOut />
              </button>
            </div>
          ) : (
            <div className="navbar__auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm">Entrar</Link>
              <Link to="/registro" className="btn btn-primary btn-sm">Registro</Link>
            </div>
          )}
        </div>

        {/* Botón hamburguesa mobile */}
        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Menú mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="navbar__mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="navbar__mobile-nav">
              <NavLink to="/peliculas" className="navbar__mobile-link" onClick={closeMenu}>
                Películas
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className="navbar__mobile-link" onClick={closeMenu}>
                  <FiShield /> Panel Admin
                </NavLink>
              )}
              {isAuthenticated ? (
                <>
                  <NavLink to="/perfil" className="navbar__mobile-link" onClick={closeMenu}>
                    <FiUser /> Mi Perfil
                  </NavLink>
                  <button className="navbar__mobile-link navbar__mobile-logout" onClick={handleLogout}>
                    <FiLogOut /> Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="navbar__mobile-link" onClick={closeMenu}>Iniciar Sesión</Link>
                  <Link to="/registro" className="navbar__mobile-link" onClick={closeMenu}>Crear Cuenta</Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
