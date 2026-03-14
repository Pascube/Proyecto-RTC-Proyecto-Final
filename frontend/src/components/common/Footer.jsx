import { Link } from 'react-router-dom';
import { FiFilm, FiGithub } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <FiFilm />
            <span>CineClub</span>
          </Link>
          <p className="footer__tagline">La comunidad de cinéfilos para cinéfilos.</p>
        </div>

        <nav className="footer__links">
          <div className="footer__links-group">
            <h4 className="footer__links-title">Explorar</h4>
            <Link to="/peliculas" className="footer__link">Películas</Link>
            <Link to="/registro" className="footer__link">Crear cuenta</Link>
            <Link to="/login" className="footer__link">Iniciar sesión</Link>
          </div>
        </nav>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copyright">© {new Date().getFullYear()} CineClub — Proyecto Final Bootcamp Full Stack</p>
          <a
            href="https://github.com"
            className="footer__github"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FiGithub />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
