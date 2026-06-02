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

export function getAdminEpisodes(params = {}) {
  return apiRequest(`/admin/episodes${buildQuery(params)}`, {
    auth: true
  });
}

export function getAdminEpisodeById(id) {
  return apiRequest(`/admin/episodes/${encodeURIComponent(id)}`, {
    auth: true
  });
}

export function createAdminEpisode(payload) {
  return apiRequest('/admin/episodes', {
    auth: true,
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateAdminEpisode(id, payload) {
  return apiRequest(`/admin/episodes/${encodeURIComponent(id)}`, {
    auth: true,
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export function softDeleteAdminEpisode(id) {
  return apiRequest(`/admin/episodes/${encodeURIComponent(id)}`, {
    auth: true,
    method: 'DELETE'
  });
}

export function updateAdminEpisodePublish(id, isPublished) {
  return apiRequest(`/admin/episodes/${encodeURIComponent(id)}/publish`, {
    auth: true,
    method: 'PATCH',
    body: JSON.stringify({ isPublished })
  });
}
