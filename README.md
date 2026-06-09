# 🎬 CineClub — Plataforma Comunitaria de Reseñas de Cine

> Descubre, valora y comenta películas con una comunidad apasionada del cine.

---

## 📖 Descripción del Proyecto

**CineClub** es una aplicación web full-stack orientada a los amantes del cine. Permite a los usuarios explorar un catálogo de películas, leer y escribir reseñas, guardar películas en su lista personal y descubrir las mejor valoradas por la comunidad.

El proyecto está diseñado pensando en un público cinéfilo que busca una plataforma sencilla, limpia y funcional donde la experiencia del usuario sea lo primero. La temática oscura del diseño refuerza la atmósfera cinematográfica.

---

## 🎯 Público Objetivo

Personas mayores de 16 años con interés en el cine que quieran:
- Llevar un registro de las películas que han visto o quieren ver.
- Compartir sus opiniones con otros usuarios.
- Descubrir nuevas películas basándose en las valoraciones de la comunidad.

---

## 🗂️ Colecciones de la Base de Datos

| Colección | Descripción |
|-----------|-------------|
| **Users** | Usuarios registrados con roles (user / admin), watchlist y perfil |
| **Movies** | Catálogo de películas con género, director, sinopsis, duración e idioma |
| **Reviews** | Reseñas con valoración (1-5 estrellas) y comentario, relacionadas con usuario y película |

Las relaciones son:
- `Review.user` → referencia a `User`
- `Review.movie` → referencia a `Movie`
- `User.watchlist[]` → array de referencias a `Movie`

---

## 🛠️ Stack Tecnológico

### Backend
| Tecnología | Uso |
|-----------|-----|
| Node.js + Express | Servidor y API REST |
| MongoDB + Mongoose | Base de datos y ODM |
| JSON Web Tokens (JWT) | Autenticación |
| bcryptjs | Hash de contraseñas |
| csv-parser + fs | Lectura de CSVs para semillas |
| helmet | Cabeceras de seguridad HTTP |
| express-validator | Validación de inputs |
| morgan | Logging de peticiones |
| cloudinary + multer | Subida de imágenes (posters) |
| TMDB API | Obtención automática de pósters reales, reparto y tráilers |
| Proxy de imágenes | Render fiable de imágenes externas vía backend |

### Frontend
| Tecnología | Uso |
|-----------|-----|
| React 18 + Vite | Framework y bundler |
| React Router v6 | Navegación SPA |
| Axios | Peticiones HTTP |
| Framer Motion ⭐ | Animaciones declarativas (librería nueva) |
| React Hot Toast ⭐ | Notificaciones (librería nueva) |
| React Icons | Iconografía |
| CSS Custom Properties | Variables de diseño |

> ⭐ Librerías no vistas en el curso, incorporadas para mejorar la experiencia de usuario.

---

## 🏗️ Arquitectura del Proyecto

```
proyecto-final/
├── backend/
│   ├── index.js                    # Punto de entrada
│   ├── .env.example                # Variables de entorno
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── db.js               # Conexión a MongoDB
│       ├── models/
│       │   ├── User.js
│       │   ├── Movie.js
│       │   └── Review.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── movieController.js
│       │   ├── reviewController.js
│       │   └── userController.js
│       ├── middleware/
│       │   ├── auth.js             # Verificación JWT
│       │   ├── isAdmin.js          # Comprobación de rol
│       │   └── errorHandler.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── imageRoutes.js      # Proxy de imágenes externas
│       │   ├── movieRoutes.js
│       │   ├── reviewRoutes.js
│       │   └── userRoutes.js
│       ├── services/
│       │   └── tmdbService.js      # Integración con TMDB
│       └── seeds/
│           ├── moviesData.csv      # 105 películas
│           ├── usersData.csv       # 10 usuarios
│           ├── reviewsData.csv     # 100+ reseñas
│           ├── seed.js             # Script de semilla
│           ├── uploadPostersToCloudinary.js
│           ├── normalizePosterUrls.js
│           └── updatePostersFromTMDB.js
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── styles/
        │   ├── variables.css       # CSS Custom Properties globales
        │   └── global.css          # Estilos base
        ├── context/
        │   └── AuthContext.jsx     # Estado global de autenticación
        ├── hooks/
        │   ├── useMovies.js        # Hook para lógica de películas
        │   ├── useDebounce.js      # Hook para debounce en búsqueda
        │   └── useLocalStorage.js  # Hook para persistencia local
        ├── services/
        │   ├── api.js              # Instancia Axios configurada
        │   ├── authService.js
        │   ├── movieService.js
        │   ├── reviewService.js
        │   └── userService.js
        ├── components/
        │   ├── common/             # Reutilizables globalmente
        │   │   ├── Navbar
        │   │   ├── Footer
        │   │   ├── LoadingSpinner
        │   │   ├── StarRating
        │   │   ├── Modal
        │   │   └── ProtectedRoute
        │   ├── movies/             # Específicos de películas
        │   │   ├── MovieCard
        │   │   ├── MovieGrid
        │   │   └── MovieFilters
        │   └── reviews/            # Específicos de reseñas
        │       ├── ReviewCard
        │       └── ReviewForm
        └── pages/
            ├── HomePage
            ├── MoviesPage
            ├── MovieDetailPage
            ├── LoginPage
            ├── RegisterPage
            ├── ProfilePage
            ├── AdminPage
            └── NotFoundPage
```

---

## 🚀 Instrucciones de Instalación

### ✅ Entrega para Evaluación (GitHub)

Este repositorio se entrega con `backend/.env` y `frontend/.env` incluidos para facilitar la corrección directa del proyecto por parte del profesor.

Pasos rápidos para ejecutar:
```bash
# Terminal 1
cd backend
npm install
npm run seed
npm start

# Terminal 2
cd frontend
npm install
npm run dev
```

Aplicación local:
- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:5000`

### Credenciales de Admin para corrección
- Email: `admin@cineclub.com`
- Password: `Admin1234!`

### Requisitos previos
- Node.js v18+
- MongoDB Atlas (o local)
- Cuenta en Cloudinary (opcional, para subida de imágenes)

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd proyecto-final
```

### 2. Configurar el Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus valores
npm run seed     # Poblar la base de datos con datos de prueba
npm run posters:tmdb  # (Opcional) Reemplazar pósters por imágenes reales de TMDB
npm run dev      # Iniciar servidor en modo desarrollo
```

### 3. Configurar el Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Editar .env con la URL del backend
npm run dev      # Iniciar cliente en modo desarrollo
```

---

## 🌐 Variables de Entorno

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/cineclub
MONGODB_URI_FALLBACK=
MONGODB_URI_LOCAL=mongodb://127.0.0.1:27017/cineclub
JWT_SECRET=tu_clave_secreta_muy_larga
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
TMDB_API_KEY=tu_tmdb_api_key
FRONTEND_URL=http://127.0.0.1:5173
NODE_ENV=development
```

Notas para corrección:
- Usa `MONGODB_URI` como conexión principal (Atlas recomendado).
- Si Atlas falla por DNS o red, el backend intentará `MONGODB_URI_FALLBACK` y luego `MONGODB_URI_LOCAL`.
- Si usas local, levanta MongoDB en `127.0.0.1:27017` y ejecuta `npm run seed`.

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## ▶️ Scripts Backend

| Script | Comando | Descripción |
|--------|---------|-------------|
| Start | `npm start` | Inicia la API en modo normal |
| Dev | `npm run dev` | Inicia la API con recarga automática |
| Seed | `npm run seed` | Ejecuta semilla de usuarios, películas y reseñas |
| Posters TMDB | `npm run posters:tmdb` | Actualiza pósters desde TMDB |

---

## 📡 Endpoints de la API

### Auth
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/me` | Perfil del usuario | Sí |

### Movies
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/movies` | Listar películas (filtros, paginación) | No |
| GET | `/api/movies/:id` | Detalle de película | No |
| GET | `/api/movies/:id/extras` | Reparto y tráiler desde TMDB | No |
| POST | `/api/movies` | Crear película | Admin |
| PUT | `/api/movies/:id` | Editar película | Admin |
| DELETE | `/api/movies/:id` | Eliminar película | Admin |
| POST | `/api/movies/:id/poster` | Subir poster | Admin |

### Images
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/images/proxy?url=<...>` | Proxy seguro para renderizar imágenes externas | No |

### Reviews
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/reviews` | Listar todas las reseñas (paginado) | No |
| GET | `/api/reviews/movie/:movieId` | Reseñas de una película | No |
| GET | `/api/reviews/:id` | Obtener reseña por ID | No |
| POST | `/api/reviews` | Crear reseña | Sí |
| PUT | `/api/reviews/:id` | Editar reseña | Sí (autor) |
| DELETE | `/api/reviews/:id` | Eliminar reseña | Sí (autor/admin) |

### Users
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/users/profile` | Ver perfil propio | Sí |
| PUT | `/api/users/profile` | Actualizar perfil | Sí |
| POST | `/api/users/watchlist/:movieId` | Añadir a watchlist | Sí |
| DELETE | `/api/users/watchlist/:movieId` | Quitar de watchlist | Sí |
| GET | `/api/users` | Listar usuarios | Admin |
| GET | `/api/users/:id` | Obtener usuario por ID | Admin |
| PUT | `/api/users/:id` | Actualizar usuario (incluye avatar/password) | Admin |
| DELETE | `/api/users/:id` | Eliminar usuario | Sí (admin o propietario) |

---

## ✨ Funcionalidades Implementadas

- [x] Autenticación completa (registro, login, JWT)
- [x] Roles de usuario (user / admin)
- [x] Catálogo de películas con búsqueda y filtros
- [x] Reseñas con valoración por estrellas
- [x] Editar y eliminar reseñas propias
- [x] Lista personal de películas (watchlist)
- [x] Perfil de usuario con watchlist y reseñas propias
- [x] Reseñas del perfil enlazadas a su película
- [x] Panel de administración para gestión del catálogo
- [x] Subida de imágenes vía Cloudinary
- [x] Actualización masiva de pósters reales vía TMDB
- [x] Proxy de imágenes para evitar bloqueos de render en frontend
- [x] Reparto principal con fotos de actores (TMDB)
- [x] Tráiler oficial embebido desde YouTube (TMDB)
- [x] Diseño responsive y oscuro
- [x] Animaciones con Framer Motion
- [x] Notificaciones con React Hot Toast
- [x] Paginación de resultados
- [x] Semilla de datos CSV → MongoDB

---

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (salt rounds: 12)
- JWT con expiración configurable
- Cabeceras HTTP seguras con Helmet
- Validación de inputs con express-validator
- Rutas protegidas por rol en backend y frontend
- Variables sensibles en `.env` (excluido del repositorio)

---

## 🚢 Despliegue

| Parte | Plataforma | URL |
|-------|-----------|-----|
| Backend | Render | `https://cineclub-api.onrender.com` |
| Frontend | Vercel | `https://cineclub.vercel.app` |
| Base de datos | MongoDB Atlas | Cloud |

---

## 👨‍💻 Autor

Proyecto Final — Bootcamp Full Stack  
Fecha: Marzo 2026
