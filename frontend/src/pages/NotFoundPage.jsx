import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="notfound-page">
      <motion.div
        className="notfound-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Página no encontrada</h1>
        <p className="notfound-message">
          Parece que esta escena fue cortada en la edición final.
        </p>
        <Link to="/" className="btn btn-primary">
          <FiArrowLeft /> Volver al inicio
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
