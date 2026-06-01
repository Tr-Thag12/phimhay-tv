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

export function fetchMovies(params = {}) {
  return apiRequest(`/movies${buildQuery(params)}`);
}

export function fetchMovieBySlug(slug) {
  return apiRequest(`/movies/${encodeURIComponent(slug)}`);
}

export function fetchMovieEpisodes(slug) {
  return apiRequest(`/movies/${encodeURIComponent(slug)}/episodes`);
}

export function increaseMovieView(slug) {
  return apiRequest(`/movies/${encodeURIComponent(slug)}/view`, {
    method: 'POST'
  });
}

export function fetchCategories() {
  return apiRequest('/categories');
}

export function fetchMoviesByCategory(slug, params = {}) {
  return apiRequest(`/categories/${encodeURIComponent(slug)}/movies${buildQuery(params)}`);
}

export function searchMovies(params = {}) {
  return apiRequest(`/search${buildQuery(params)}`);
}
