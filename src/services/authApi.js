import { apiRequest } from './apiClient.js';

export function register({ email, password, displayName }) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName })
  });
}

export function login({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export function getMe() {
  return apiRequest('/auth/me', {
    auth: true
  });
}

export function logout() {
  return apiRequest('/auth/logout', {
    method: 'POST',
    auth: true
  });
}
