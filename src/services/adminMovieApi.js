import { apiRequest } from './apiClient.js';

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, value);
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export function getAdminMovies(params = {}) {
  return apiRequest(`/admin/movies${buildQuery(params)}`, {
    auth: true
  });
}

export function getAdminMovieById(id) {
  return apiRequest(`/admin/movies/${encodeURIComponent(id)}`, {
    auth: true
  });
}

export function createAdminMovie(payload) {
  return apiRequest('/admin/movies', {
    auth: true,
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateAdminMovie(id, payload) {
  return apiRequest(`/admin/movies/${encodeURIComponent(id)}`, {
    auth: true,
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export function softDeleteAdminMovie(id) {
  return apiRequest(`/admin/movies/${encodeURIComponent(id)}`, {
    auth: true,
    method: 'DELETE'
  });
}

export function updateAdminMoviePublish(id, isPublished) {
  return apiRequest(`/admin/movies/${encodeURIComponent(id)}/publish`, {
    auth: true,
    method: 'PATCH',
    body: JSON.stringify({ isPublished })
  });
}

export function updateAdminMovieFeatured(id, isFeatured) {
  return apiRequest(`/admin/movies/${encodeURIComponent(id)}/featured`, {
    auth: true,
    method: 'PATCH',
    body: JSON.stringify({ isFeatured })
  });
}
