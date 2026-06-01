import { getHistory } from '../features/history.js';
import { getWatchlist } from '../features/watchlist.js';
import { getUserLibraryStatus } from '../data/userLibraryRepository.js';
import {
  getAuthState,
  login as loginAuth,
  logout as logoutAuth,
  register as registerAuth,
  setAuthState
} from '../state/authStore.js';
import { getState } from '../state/store.js';
import { createIcons, qsa } from '../utils/dom.js';
import { escapeHTML } from '../utils/format.js';
import { imageFallbackAttr } from '../utils/imageFallback.js';
import { watchUrl } from '../utils/slug.js';
import { icon, movieById, renderMovieCard } from './layout.js';

const DEV_ACCOUNTS = [
  ['admin@phimhay.local', 'Admin@123456', 'ADMIN'],
  ['user@phimhay.local', 'User@123456', 'USER']
];

function userInitials(user) {
  const source = user?.displayName || user?.email || 'TK';
  return source
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

function formatUserDate(value) {
  if (!value) return 'Chưa rõ';

  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(value));
  } catch {
    return 'Chưa rõ';
  }
}

function renderAuthMessage(auth) {
  if (auth.authError) {
    return `<div class="auth-message error">${escapeHTML(auth.authError)}</div>`;
  }

  if (auth.authMessage) {
    return `<div class="auth-message success">${escapeHTML(auth.authMessage)}</div>`;
  }

  return '';
}

function renderDevAccounts() {
  return `<div class="auth-dev-note">
    <span class="muted">Tài khoản local dev</span>
    ${DEV_ACCOUNTS.map(([email, password, role]) => `
      <div><strong>${escapeHTML(role)}</strong><code>${escapeHTML(email)}</code><code>${escapeHTML(password)}</code></div>
    `).join('')}
  </div>`;
}

function libraryNote(auth) {
  const status = getUserLibraryStatus();

  if (!auth.isAuthenticated) {
    return 'Đăng nhập để đồng bộ danh sách yêu thích và lịch sử xem theo tài khoản. Khi chưa đăng nhập, dữ liệu vẫn lưu trên trình duyệt bằng localStorage.';
  }

  if (status.isBackendSynced) {
    return 'Danh sách yêu thích và lịch sử xem đang đồng bộ theo tài khoản.';
  }

  return 'Backend thư viện chưa khả dụng nên danh sách yêu thích và lịch sử xem đang tạm dùng localStorage fallback.';
}

function renderLoggedOut(app) {
  const state = getState();
  const auth = getAuthState();
  const mode = state.accountAuthMode === 'register' ? 'register' : 'login';

  app.innerHTML = `<div class="account-page container">
    <div class="auth-page-head">
      <p class="eyebrow">Tài khoản PhimHay TV</p>
      <h1>Đăng nhập để dùng hồ sơ thật</h1>
      <p class="muted">Auth frontend đang gọi backend local qua JWT Bearer token. ${escapeHTML(libraryNote(auth))}</p>
    </div>

    <div class="auth-shell">
      <section class="auth-panel">
        <div class="auth-tabs" role="tablist" aria-label="Chọn chế độ auth">
          <button class="auth-tab ${mode === 'login' ? 'active' : ''}" type="button" data-auth-mode="login">Đăng nhập</button>
          <button class="auth-tab ${mode === 'register' ? 'active' : ''}" type="button" data-auth-mode="register">Đăng ký</button>
        </div>

        ${renderAuthMessage(auth)}

        <form class="auth-form ${mode === 'login' ? 'active' : ''}" data-auth-form="login">
          <label>
            <span>Email</span>
            <input type="email" name="email" autocomplete="email" placeholder="user@phimhay.local">
          </label>
          <label>
            <span>Mật khẩu</span>
            <input type="password" name="password" autocomplete="current-password" placeholder="User@123456">
          </label>
          <button class="btn btn-primary" type="submit" ${auth.isAuthLoading ? 'disabled' : ''}>${icon('log-in')} ${auth.isAuthLoading ? 'Đang xử lý...' : 'Đăng nhập'}</button>
        </form>

        <form class="auth-form ${mode === 'register' ? 'active' : ''}" data-auth-form="register">
          <label>
            <span>Tên hiển thị</span>
            <input type="text" name="displayName" autocomplete="name" placeholder="Frontend Test">
          </label>
          <label>
            <span>Email</span>
            <input type="email" name="email" autocomplete="email" placeholder="frontendtest@phimhay.local">
          </label>
          <label>
            <span>Mật khẩu</span>
            <input type="password" name="password" autocomplete="new-password" placeholder="Tối thiểu 8 ký tự">
          </label>
          <button class="btn btn-primary" type="submit" ${auth.isAuthLoading ? 'disabled' : ''}>${icon('user-plus')} ${auth.isAuthLoading ? 'Đang xử lý...' : 'Đăng ký'}</button>
        </form>

        <p class="auth-backend-note">Nếu chưa kết nối được backend auth, hãy chạy backend local để đăng nhập.</p>
      </section>

      <aside class="auth-help">
        <h2>Kiểm thử nhanh</h2>
        <p class="muted">Chạy database, backend và frontend local, sau đó dùng một trong hai tài khoản mẫu dưới đây.</p>
        ${renderDevAccounts()}
      </aside>
    </div>
  </div>`;

  bindLoggedOutEvents(app);
}

function renderLoggedIn(app) {
  const state = getState();
  const auth = getAuthState();
  const currentUser = auth.user;
  const watchlist = getWatchlist().map(movieById);
  const history = getHistory().map(item => ({ ...item, movie: item.movie || movieById(item.movieId) }));
  const tabs = [
    ['profile', 'Hồ sơ'],
    ['watchlist', 'Danh sách của tôi'],
    ['history', 'Lịch sử xem'],
    ['subscription', 'Gói dịch vụ'],
    ['devices', 'Thiết bị'],
    ['settings', 'Cài đặt']
  ];

  app.innerHTML = `<div class="account-page container">
    <div class="profile-head">
      ${currentUser.avatarUrl
        ? `<img src="${escapeHTML(currentUser.avatarUrl)}" alt="Avatar" width="80" height="80" loading="lazy" decoding="async" ${imageFallbackAttr('avatar')}>`
        : `<div class="profile-avatar-fallback">${escapeHTML(userInitials(currentUser))}</div>`}
      <div>
        <div class="badges">
          <span class="badge ${currentUser.role === 'ADMIN' ? 'red' : ''}">${escapeHTML(currentUser.role)}</span>
          <span class="badge gold">${escapeHTML(currentUser.status)}</span>
        </div>
        <h1>${escapeHTML(currentUser.displayName || currentUser.email)}</h1>
        <p class="muted">${escapeHTML(currentUser.email)}</p>
      </div>
      <button class="btn btn-danger account-logout-btn" type="button" data-auth-logout ${auth.isAuthLoading ? 'disabled' : ''}>${icon('log-out')} Đăng xuất</button>
    </div>

    ${renderAuthMessage(auth)}

    <div class="account-layout">
      <aside class="account-sidebar">${tabs.map(([key, label]) => `<button class="account-tab ${state.accountTab === key ? 'active' : ''}" onclick="setAccountTab('${key}')">${label}</button>`).join('')}</aside>
      <section>
        <div class="account-panel ${state.accountTab === 'profile' ? 'active' : ''}">
          <div class="account-grid">
            <div class="account-card"><span class="muted">Tên hiển thị</span><h3>${escapeHTML(currentUser.displayName || 'Chưa cập nhật')}</h3></div>
            <div class="account-card"><span class="muted">Email</span><h3>${escapeHTML(currentUser.email)}</h3></div>
            <div class="account-card"><span class="muted">Vai trò</span><h3>${escapeHTML(currentUser.role)}</h3></div>
            <div class="account-card"><span class="muted">Trạng thái</span><h3>${escapeHTML(currentUser.status)}</h3></div>
            <div class="account-card"><span class="muted">Ngày tạo</span><h3>${formatUserDate(currentUser.createdAt)}</h3></div>
            <div class="account-card"><span class="muted">Cập nhật</span><h3>${formatUserDate(currentUser.updatedAt)}</h3></div>
          </div>
          <div class="account-note">${icon('info')} ${escapeHTML(libraryNote(auth))}</div>
        </div>
        <div class="account-panel ${state.accountTab === 'watchlist' ? 'active' : ''}"><div class="movie-grid">${watchlist.length ? watchlist.map(movie => renderMovieCard(movie)).join('') : `<div class="empty-state" style="grid-column:1/-1"><span>${icon('bookmark')}</span><strong>Chưa lưu phim nào.</strong></div>`}</div></div>
        <div class="account-panel ${state.accountTab === 'history' ? 'active' : ''}">${history.length ? history.map(item => `<a class="history-item" href="${watchUrl(item.movie, item.episodeId)}"><img src="${item.movie.backdrop}" alt="${escapeHTML(item.movie.title)}" width="260" height="146" loading="lazy" decoding="async" ${imageFallbackAttr('backdrop')}><div style="flex:1"><strong>${escapeHTML(item.movie.title)}</strong><p class="muted">Đã xem ${item.progress}%</p><div class="bar"><span style="width:${item.progress}%"></span></div></div></a>`).join('') : `<div class="empty-state"><span>${icon('history')}</span><strong>Chưa có lịch sử xem.</strong></div>`}</div>
        <div class="account-panel ${state.accountTab === 'subscription' ? 'active' : ''}"><div class="account-card"><span class="badge red">Chưa đồng bộ backend</span><h2>Thông tin gói dịch vụ</h2><p class="muted">Gói dịch vụ vẫn là UI demo ở bước này.</p><button class="btn btn-ghost" disabled>${icon('lock')} Chưa khả dụng</button></div></div>
        <div class="account-panel ${state.accountTab === 'devices' ? 'active' : ''}"><div class="account-card"><h2>Thiết bị</h2><p class="muted">Quản lý thiết bị sẽ bổ sung sau khi hoàn thiện auth production.</p></div></div>
        <div class="account-panel ${state.accountTab === 'settings' ? 'active' : ''}"><div class="account-card"><p>Phụ đề mặc định: <strong>Tiếng Việt</strong></p><p>Chất lượng phát: <strong>Tự động 4K</strong></p><p>Ngôn ngữ giao diện: <strong>Tiếng Việt</strong></p><button class="btn btn-danger" type="button" data-auth-logout>${icon('log-out')} Đăng xuất</button></div></div>
      </section>
    </div>
  </div>`;

  bindLoggedInEvents(app);
}

function bindLoggedOutEvents(app) {
  qsa('[data-auth-mode]', app).forEach(button => {
    button.addEventListener('click', () => {
      getState().accountAuthMode = button.dataset.authMode;
      setAuthState({ authError: null, authMessage: null });
      renderAccount(app);
      createIcons();
    });
  });

  app.querySelector('[data-auth-form="login"]')?.addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    if (!email) {
      setAuthState({ authError: 'Email không được để trống.', authMessage: null });
      return;
    }

    if (!password) {
      setAuthState({ authError: 'Mật khẩu không được để trống.', authMessage: null });
      return;
    }

    await loginAuth(email, password);
  });

  app.querySelector('[data-auth-form="register"]')?.addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const displayName = String(formData.get('displayName') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    if (!email) {
      setAuthState({ authError: 'Email không được để trống.', authMessage: null });
      return;
    }

    if (!password) {
      setAuthState({ authError: 'Mật khẩu không được để trống.', authMessage: null });
      return;
    }

    if (password.length < 8) {
      setAuthState({ authError: 'Mật khẩu đăng ký phải có ít nhất 8 ký tự.', authMessage: null });
      return;
    }

    const nextAuth = await registerAuth(email, password, displayName);
    if (!nextAuth.authError) {
      getState().accountAuthMode = 'login';
      renderAccount(app);
      createIcons();
    }
  });
}

function bindLoggedInEvents(app) {
  qsa('[data-auth-logout]', app).forEach(button => {
    button.addEventListener('click', async () => {
      await logoutAuth();
      getState().accountTab = 'profile';
      getState().accountAuthMode = 'login';
    });
  });
}

export function renderAccount(app) {
  const auth = getAuthState();

  if (!auth.isAuthenticated) {
    renderLoggedOut(app);
    return;
  }

  renderLoggedIn(app);
}
