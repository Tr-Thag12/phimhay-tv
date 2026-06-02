import { apiRequest } from './apiClient.js';

export function getAdminHealth() {
  return apiRequest('/admin/health', {
    auth: true
  });
}
