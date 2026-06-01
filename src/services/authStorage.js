const AUTH_TOKEN_KEY = 'phimhay_auth_token';

function getSessionStorage() {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return null;
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function getAuthToken() {
  const storage = getSessionStorage();
  if (!storage) return '';

  try {
    return storage.getItem(AUTH_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setAuthToken(token) {
  const storage = getSessionStorage();
  if (!storage || !token) return;

  try {
    storage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // Session storage can be unavailable in restricted browser contexts.
  }
}

export function clearAuthToken() {
  const storage = getSessionStorage();
  if (!storage) return;

  try {
    storage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // Ignore storage cleanup failures so logout never crashes the app.
  }
}

export function hasAuthToken() {
  return Boolean(getAuthToken());
}
