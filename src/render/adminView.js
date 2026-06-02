import { getAdminHealth } from '../services/adminApi.js';
import { ApiError } from '../services/apiClient.js';
import { getAuthState } from '../state/authStore.js';
import { getAdminGuardState } from '../utils/adminGuard.js';
import { createIcons } from '../utils/dom.js';
import { escapeHTML } from '../utils/format.js';
import { icon } from './layout.js';

let requestId = 0;

const ADMIN_BACKEND_OFFLINE_MESSAGE =
  'Không kết nối được backend admin. Hãy chạy backend local.';

const PLACEHOLDER_CARDS = [
  ['film', 'Quản lý phim'],
  ['list-video', 'Quản lý tập phim'],
  ['tags', 'Quản lý thể loại'],
  ['users', 'Quản lý người dùng'],
  ['message-square-warning', 'Quản lý bình luận/báo lỗi']
];

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

function renderAdminShell(app, auth, health) {
  const user = auth.user || {};
  const displayName = user.displayName || user.email || 'Admin PhimHay TV';

  app.innerHTML = `<div class="admin-page container">
    <section class="admin-hero">
      <div>
        <p class="eyebrow">Admin shell local</p>
        <h1>Quản trị PhimHay TV</h1>
        <p class="muted">CRUD admin sẽ được phát triển ở bước sau.</p>
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

    <section class="admin-grid" aria-label="Các chức năng admin sắp làm">
      ${PLACEHOLDER_CARDS.map(([cardIcon, title]) => `<article class="admin-card">
        <span>${icon(cardIcon)}</span>
        <h3>${escapeHTML(title)}</h3>
        <p class="muted">Placeholder an toàn, chưa dẫn tới CRUD thật.</p>
        <button class="btn btn-ghost" type="button" disabled>${icon('lock')} Sắp làm</button>
      </article>`).join('')}
    </section>

    <section class="admin-note">
      ${icon('info')}
      <p>CRUD admin sẽ được phát triển ở bước sau. Route này chỉ xác thực quyền admin và hiển thị shell cơ bản.</p>
    </section>
  </div>`;
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
