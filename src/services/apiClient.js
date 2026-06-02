import { getAuthToken } from './authStorage.js';

const DEFAULT_API_BASE_URL = 'http://localhost:4000/api';
const DEFAULT_REQUEST_TIMEOUT_MS = 5000;

function normalizeBaseUrl(value) {
  return String(value || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
}

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export async function apiRequest(path, options = {}) {
  const {
    auth = false,
    token,
    headers = {},
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
    ...fetchOptions
  } = options;
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };
  const authToken = token || (auth ? getAuthToken() : '');

  if (authToken) {
    requestHeaders.Authorization = `Bearer ${authToken}`;
  }

  let response;
  let timeoutId = null;
  let requestOptions = {
    ...fetchOptions,
    headers: requestHeaders
  };

  if (timeoutMs > 0 && typeof AbortController !== 'undefined') {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    if (fetchOptions.signal) {
      if (fetchOptions.signal.aborted) {
        controller.abort();
      } else {
        fetchOptions.signal.addEventListener('abort', () => controller.abort(), { once: true });
      }
    }

    requestOptions = {
      ...requestOptions,
      signal: controller.signal
    };
  }

  try {
    response = await fetch(url, requestOptions);
  } catch (error) {
    throw new ApiError('Chưa kết nối được API PhimHay TV', 0, { originalError: error });
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    throw new ApiError(payload?.message || 'API PhimHay TV tra ve loi', response.status, payload);
  }

  return payload?.data ?? payload;
}
