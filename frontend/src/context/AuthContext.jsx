import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authService from '../services/authService';

// ── Estado inicial ─────────────────────────────────────────────────────────────
const initialState = {
  user: null,
  token: localStorage.getItem('cineclub_token') || null,
  isAuthenticated: false,
  isLoading: true,
};

// ── Tipos de acción ────────────────────────────────────────────────────────────
const AUTH_ACTIONS = {
  SET_USER: 'SET_USER',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER',
};

// ── Reducer ────────────────────────────────────────────────────────────────────
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      localStorage.setItem('cineclub_token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('cineclub_token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
};

// ── Contexto ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ───────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar token guardado al cargar la app
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('cineclub_token');
      if (!token) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      try {
        const { user } = await authService.getMe();
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
      } catch {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: data });
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const data = await authService.register(userData);
    dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: data });
    return data;
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  const updateUser = useCallback((updatedFields) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: updatedFields });
  }, []);

  const isAdmin = state.user?.role === 'admin';

  const value = {
    ...state,
    isAdmin,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ── Hook de acceso al contexto ─────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
