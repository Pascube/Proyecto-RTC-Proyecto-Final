const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

export const getProxiedImageUrl = (url) => {
  if (!url) return '';
  return `${API_ORIGIN}/api/images/proxy?url=${encodeURIComponent(url)}`;
};
