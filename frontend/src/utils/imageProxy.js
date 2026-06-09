export const getProxiedImageUrl = (url) => {
  if (!url) return '';
  return `/api/images/proxy?url=${encodeURIComponent(url)}`;
};
