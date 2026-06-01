import { apiRequest } from './apiClient.js';

export function getMyWatchlist() {
  return apiRequest('/me/watchlist', {
    auth: true
  });
}

export function addToMyWatchlist(movieId) {
  return apiRequest(`/me/watchlist/${encodeURIComponent(movieId)}`, {
    method: 'POST',
    auth: true
  });
}

export function removeFromMyWatchlist(movieId) {
  return apiRequest(`/me/watchlist/${encodeURIComponent(movieId)}`, {
    method: 'DELETE',
    auth: true
  });
}

export function getMyHistory(params = {}) {
  const search = new URLSearchParams();

  if (params.limit) {
    search.set('limit', String(params.limit));
  }

  return apiRequest(`/me/history${search.toString() ? `?${search}` : ''}`, {
    auth: true
  });
}

export function saveMyHistory(payload) {
  return apiRequest('/me/history', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload)
  });
}

export function removeMyHistoryItem(id) {
  return apiRequest(`/me/history/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true
  });
}

export function clearMyHistory() {
  return apiRequest('/me/history', {
    method: 'DELETE',
    auth: true
  });
}
