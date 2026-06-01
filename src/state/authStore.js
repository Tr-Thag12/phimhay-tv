import {
  getMe as getMeRequest,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest
} from '../services/authApi.js';
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken
} from '../services/authStorage.js';

const BACKEND_AUTH_OFFLINE_MESSAGE =
  'Chưa kết nối được backend auth. Hãy chạy backend local để đăng nhập.';

const authState = {
  user: null,
  token: getAuthToken(),
  isAuthenticated: false,
  isAuthLoading: false,
  authError: null,
  authMessage: null
};

const listeners = new Set();

function notifyAuthListeners() {
  listeners.forEach(listener => listener(getAuthState()));
}

function authErrorMessage(error) {
  if (error?.status === 0) return BACKEND_AUTH_OFFLINE_MESSAGE;
  return error?.message || 'Không xử lý được yêu cầu auth. Vui lòng thử lại.';
}

export function getAuthState() {
  return authState;
}

export function setAuthState(partial = {}) {
  Object.assign(authState, partial);
  notifyAuthListeners();
  return authState;
}

export function subscribeAuth(listener) {
  if (typeof listener !== 'function') return () => {};
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setLoggedOut(partial = {}) {
  clearAuthToken();
  return setAuthState({
    user: null,
    token: '',
    isAuthenticated: false,
    isAuthLoading: false,
    ...partial
  });
}

export async function initAuth() {
  const token = getAuthToken();

  if (!token) {
    setLoggedOut({ authError: null, authMessage: null });
    return getAuthState();
  }

  setAuthState({
    token,
    isAuthLoading: true,
    authError: null,
    authMessage: null
  });

  try {
    const data = await getMeRequest();
    return setAuthState({
      user: data.user,
      token,
      isAuthenticated: true,
      isAuthLoading: false,
      authError: null,
      authMessage: null
    });
  } catch (error) {
    if (error?.status === 0) {
      return setAuthState({
        user: null,
        token,
        isAuthenticated: false,
        isAuthLoading: false,
        authError: authErrorMessage(error),
        authMessage: null
      });
    }

    setLoggedOut({
      authError: authErrorMessage(error),
      authMessage: null
    });
    return getAuthState();
  }
}

export async function login(email, password) {
  setAuthState({
    isAuthLoading: true,
    authError: null,
    authMessage: null
  });

  try {
    const data = await loginRequest({ email, password });
    setAuthToken(data.token);

    return setAuthState({
      user: data.user,
      token: data.token,
      isAuthenticated: true,
      isAuthLoading: false,
      authError: null,
      authMessage: 'Đăng nhập thành công.'
    });
  } catch (error) {
    setLoggedOut({
      authError: authErrorMessage(error),
      authMessage: null
    });
    return getAuthState();
  }
}

export async function register(email, password, displayName) {
  setAuthState({
    isAuthLoading: true,
    authError: null,
    authMessage: null
  });

  try {
    const data = await registerRequest({ email, password, displayName });

    return setAuthState({
      isAuthLoading: false,
      authError: null,
      authMessage: `Đăng ký tài khoản ${data.user.email} thành công. Bạn có thể đăng nhập ngay.`
    });
  } catch (error) {
    return setAuthState({
      isAuthLoading: false,
      authError: authErrorMessage(error),
      authMessage: null
    });
  }
}

export async function logout() {
  const token = getAuthToken();

  setAuthState({
    isAuthLoading: true,
    authError: null,
    authMessage: null
  });

  if (token) {
    try {
      await logoutRequest();
    } catch {
      // JWT logout is stateless; local token cleanup is the important step.
    }
  }

  return setLoggedOut({
    authError: null,
    authMessage: 'Đã đăng xuất.'
  });
}

export async function getCurrentUser() {
  try {
    const data = await getMeRequest();
    return setAuthState({
      user: data.user,
      isAuthenticated: true,
      authError: null
    });
  } catch (error) {
    setLoggedOut({
      authError: authErrorMessage(error),
      authMessage: null
    });
    return getAuthState();
  }
}
