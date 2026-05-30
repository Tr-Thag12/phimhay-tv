import { getState } from '../state/store.js';
import { escapeHTML } from '../utils/format.js';
import { icon } from './layout.js';

export function renderNotFound(app) {
  const state = getState();
  const message = state.notFoundMessage || 'Đường dẫn này không tồn tại hoặc nội dung đã được chuyển sang URL khác.';

  app.innerHTML = `<div class="not-found-page container">
    <section class="not-found-card">
      <span class="not-found-icon">${icon('search-x')}</span>
      <p class="eyebrow">404</p>
      <h1>Không tìm thấy trang</h1>
      <p class="muted">${escapeHTML(message)}</p>
      <div class="actions">
        <a class="btn btn-primary" href="/">${icon('home')} Về trang chủ</a>
        <a class="btn btn-ghost" href="/phim-le">${icon('film')} Xem phim lẻ</a>
      </div>
    </section>
  </div>`;
}
