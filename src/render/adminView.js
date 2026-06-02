import { getAdminHealth } from '../services/adminApi.js';
import { ApiError } from '../services/apiClient.js';
import { getAuthState } from '../state/authStore.js';
import { getAdminGuardState } from '../utils/adminGuard.js';
import { createIcons } from '../utils/dom.js';
import { escapeHTML } from '../utils/format.js';
import { renderAdminEpisodeManager } from './adminEpisodeView.js';
import { renderAdminMovieManager } from './adminMovieView.js';
import { icon } from './layout.js';

let requestId = 0;
let activeAdminTab = 'movies';

const ADMIN_BACKEND_OFFLINE_MESSAGE =
  'Không kết nối được backend admin. Hãy chạy backend local.';

const PLACEHOLDER_CARDS = [
  ['tags', 'Quản lý thể loại'],
  ['users', 'Quản lý người dùng'],
  ['message-square-warning', 'Quản lý bình luận/báo lỗi']
];

function bindAdminTabs(app, auth, health) {
  app.querySelectorAll('[data-admin-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      activeAdminTab = button.dataset.adminTab || 'overview';
      renderAdminShell(app, auth, health);
      createIcons();
    });
  });
}

function renderAdminBlocked(app, { iconName, title, message, action = '' }) {
  app.innerHTML = `<div class="admin-page container">
    <section class="admin-blocked">
      <span class="admin-blocked-icon">${icon(iconName)}</span>
      <p class="eyebrow">Khu vực quản trị</p>
      <h1>${escapeHTML(title)}</h1>
      <p class="muted">${escapeHTML(message)}</p>
      ${action}
    </section>
  </div>`;
}

function renderAdminLoading(app) {
  renderAdminBlocked(app, {
    iconName: 'loader',
    title: 'Đang kiểm tra quyền admin',
    message: 'Vui lòng chờ trong giây lát.'
  });
}

function renderOverviewPanel() {
  return `<div class="admin-grid" aria-label="Các chức năng admin">
    <article class="admin-card admin-card-ready">
      <span>${icon('film')}</span>
      <h3>Quản lý phim</h3>
      <p class="muted">Đã nối CRUD phim với backend Admin Movie API.</p>
      <button class="btn btn-primary" type="button" data-admin-tab="movies">${icon('arrow-right')} Mở quản lý phim</button>
    </article>
    <article class="admin-card admin-card-ready">
      <span>${icon('list-video')}</span>
      <h3>Quản lý tập phim</h3>
      <p class="muted">Đã nối CRUD tập phim với backend Admin Episode API.</p>
      <button class="btn btn-primary" type="button" data-admin-tab="episodes">${icon('arrow-right')} Mở quản lý tập phim</button>
    </article>
    ${PLACEHOLDER_CARDS.map(([cardIcon, title]) => `<article class="admin-card">
      <span>${icon(cardIcon)}</span>
      <h3>${escapeHTML(title)}</h3>
      <p class="muted">Chưa làm trong bước này để giữ phạm vi CRUD phim và tập phim.</p>
      <button class="btn btn-ghost" type="button" disabled>${icon('lock')} Chưa làm</button>
    </article>`).join('')}
  </div>`;
}

function renderAdminShell(app, auth, health) {
  const user = auth.user || {};
  const displayName = user.displayName || user.email || 'Admin PhimHay TV';
  const isOverview = activeAdminTab === 'overview';
  const isMovies = activeAdminTab === 'movies';
  const isEpisodes = activeAdminTab === 'episodes';

  app.innerHTML = `<div class="admin-page container">
    <section class="admin-hero">
      <div>
        <p class="eyebrow">Admin shell local</p>
        <h1>Quản trị PhimHay TV</h1>
        <p class="muted">Khu vực admin đã có giao diện quản lý phim và tập phim nối trực tiếp với Admin API local.</p>
      </div>
      <div class="admin-status">
        <span class="badge gold">${escapeHTML(health.role || user.role || 'ADMIN')}</span>
        <small>${escapeHTML(health.timestamp || '')}</small>
      </div>
    </section>

    <section class="admin-profile">
      <div class="profile-avatar-fallback">${escapeHTML(displayName.trim().slice(0, 2).toUpperCase())}</div>
      <div>
        <span class="muted">Admin hiện tại</span>
        <h2>${escapeHTML(displayName)}</h2>
        <p class="muted">${escapeHTML(user.email || health.email || '')}</p>
      </div>
      <div class="badges">
        <span class="badge red">${escapeHTML(user.role || health.role || 'ADMIN')}</span>
      </div>
    </section>

    <nav class="admin-tabs" aria-label="Khu vực admin">
      <button class="admin-tab ${isOverview ? 'active' : ''}" type="button" data-admin-tab="overview">${icon('layout-dashboard')} Tổng quan</button>
      <button class="admin-tab ${isMovies ? 'active' : ''}" type="button" data-admin-tab="movies">${icon('film')} Quản lý phim</button>
      <button class="admin-tab ${isEpisodes ? 'active' : ''}" type="button" data-admin-tab="episodes">${icon('list-video')} Quản lý tập phim</button>
    </nav>

    <section class="admin-tab-panel ${isOverview ? 'active' : ''}" ${isOverview ? '' : 'hidden'}>
      ${renderOverviewPanel()}
    </section>

    <section class="admin-tab-panel ${isMovies ? 'active' : ''}" ${isMovies ? '' : 'hidden'}>
      <div data-admin-movie-root></div>
    </section>

    <section class="admin-tab-panel ${isEpisodes ? 'active' : ''}" ${isEpisodes ? '' : 'hidden'}>
      <div data-admin-episode-root></div>
    </section>

    <section class="admin-note">
      ${icon('info')}
      <p>Route admin vẫn kiểm tra quyền bằng frontend guard và <code>GET /api/admin/health</code>. CRUD hiện áp dụng cho phim và tập phim; thể loại, user và bình luận/báo lỗi chưa được làm.</p>
    </section>
  </div>`;

  bindAdminTabs(app, auth, health);

  if (isMovies) {
    const movieRoot = app.querySelector('[data-admin-movie-root]');
    if (movieRoot) renderAdminMovieManager(movieRoot);
  }

  if (isEpisodes) {
    const episodeRoot = app.querySelector('[data-admin-episode-root]');
    if (episodeRoot) renderAdminEpisodeManager(episodeRoot);
  }
}

function renderAdminError(app, message) {
  renderAdminBlocked(app, {
    iconName: 'shield-alert',
    title: 'Không thể mở admin shell',
    message
  });
}

export async function renderAdmin(app) {
  const auth = getAuthState();
  const guard = getAdminGuardState(auth);
  const currentRequest = ++requestId;

  if (guard.status === 'loading') {
    renderAdminLoading(app);
    createIcons();
    return;
  }

  if (guard.status === 'login-required') {
    renderAdminBlocked(app, {
      iconName: 'lock',
      title: 'Cần đăng nhập admin',
      message: 'Bạn cần đăng nhập bằng tài khoản admin để truy cập khu vực này.',
      action: `<a class="btn btn-primary" href="/tai-khoan">${icon('log-in')} Về trang tài khoản</a>`
    });
    createIcons();
    return;
  }

  if (guard.status === 'forbidden') {
    renderAdminBlocked(app, {
      iconName: 'shield-x',
      title: 'Không đủ quyền',
      message: 'Bạn không có quyền truy cập khu vực admin.'
    });
    createIcons();
    return;
  }

  renderAdminLoading(app);
  createIcons();

  try {
    const health = await getAdminHealth();
    if (currentRequest !== requestId) return;
    renderAdminShell(app, { ...auth, user: guard.user || auth.user }, health);
  } catch (error) {
    if (currentRequest !== requestId) return;
    const message = error instanceof ApiError && error.status === 0
      ? ADMIN_BACKEND_OFFLINE_MESSAGE
      : error?.message || ADMIN_BACKEND_OFFLINE_MESSAGE;
    renderAdminError(app, message);
  }

  createIcons();
}
