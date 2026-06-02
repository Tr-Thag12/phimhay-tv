import { getAuthToken } from '../services/authStorage.js';

function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;

  const [, payload] = token.split('.');
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function getAdminGuardState(auth) {
  if (auth.isAuthLoading) {
    return { status: 'loading', user: null };
  }

  if (auth.isAuthenticated) {
    return auth.user?.role === 'ADMIN'
      ? { status: 'admin', user: auth.user }
      : { status: 'forbidden', user: auth.user };
  }

  const decoded = decodeJwtPayload(getAuthToken());

  if (decoded?.role === 'ADMIN') {
    return {
      status: 'admin',
      user: {
        email: decoded.email,
        role: decoded.role,
        displayName: decoded.email
      }
    };
  }

  if (decoded?.role) {
    return { status: 'forbidden', user: decoded };
  }

  return { status: 'login-required', user: null };
}
