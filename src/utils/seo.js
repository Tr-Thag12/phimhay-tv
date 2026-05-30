const DEFAULT_DESCRIPTION = 'PhimHay TV là frontend mock cho nền tảng xem phim online với giao diện dark cinematic.';

function ensureMetaDescription() {
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'description');
    document.head.appendChild(meta);
  }
  return meta;
}

function ensureCanonical() {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  return canonical;
}

export function updateSeoMeta({ title, description = DEFAULT_DESCRIPTION, canonicalPath } = {}) {
  document.title = title || 'PhimHay TV - Xem phim online';
  ensureMetaDescription().setAttribute('content', description || DEFAULT_DESCRIPTION);

  const path = canonicalPath || window.location.pathname || '/';
  ensureCanonical().setAttribute('href', `${window.location.origin}${path}`);
}
