import { user } from '../data/movies.js';
import { getHistory } from '../features/history.js';
import { getWatchlist } from '../features/watchlist.js';
import { getState } from '../state/store.js';
import { escapeHTML } from '../utils/format.js';
import { icon, movieById, renderMovieCard } from './layout.js';

export function renderAccount(app) {
  const state = getState();
  const watchlist = getWatchlist().map(movieById);
  const history = getHistory().map(item => ({ ...item, movie: movieById(item.movieId) }));
  const tabs = [
    ['profile','Hồ sơ'],
    ['watchlist','Danh sách của tôi'],
    ['history','Lịch sử xem'],
    ['subscription','Gói dịch vụ'],
    ['devices','Thiết bị'],
    ['settings','Cài đặt']
  ];

  app.innerHTML = `<div class="account-page container">
    <div class="profile-head"><img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=160&auto=format&fit=crop" alt="Avatar" width="80" height="80"><div><h1>${escapeHTML(user.name)}</h1><p class="muted">${escapeHTML(user.email)} • ${user.plan}</p></div></div>
    <div class="account-layout">
      <aside class="account-sidebar">${tabs.map(([key,label]) => `<button class="account-tab ${state.accountTab === key ? 'active' : ''}" onclick="setAccountTab('${key}')">${label}</button>`).join('')}</aside>
      <section>
        <div class="account-panel ${state.accountTab === 'profile' ? 'active' : ''}"><div class="account-grid"><div class="account-card"><span class="muted">Họ tên</span><h3>${escapeHTML(user.name)}</h3></div><div class="account-card"><span class="muted">Email</span><h3>${escapeHTML(user.email)}</h3></div><div class="account-card"><span class="muted">Số điện thoại</span><h3>Chưa cập nhật</h3></div><div class="account-card"><span class="muted">Ngày tham gia</span><h3>${user.joined}</h3></div></div></div>
        <div class="account-panel ${state.accountTab === 'watchlist' ? 'active' : ''}"><div class="movie-grid">${watchlist.length ? watchlist.map(movie => renderMovieCard(movie)).join('') : '<div class="empty-state" style="grid-column:1/-1">Chưa lưu phim nào.</div>'}</div></div>
        <div class="account-panel ${state.accountTab === 'history' ? 'active' : ''}">${history.map(item => `<div class="history-item" onclick="playMovie(${item.movie.id}, '${item.episodeId || ''}')"><img src="${item.movie.backdrop}" alt="${escapeHTML(item.movie.title)}" width="260" height="146"><div style="flex:1"><strong>${escapeHTML(item.movie.title)}</strong><p class="muted">Đã xem ${item.progress}%</p><div class="bar"><span style="width:${item.progress}%"></span></div></div></div>`).join('')}</div>
        <div class="account-panel ${state.accountTab === 'subscription' ? 'active' : ''}"><div class="account-card"><span class="badge red">Gói hiện tại</span><h2>Premium 4K</h2><p class="muted">99.000đ/tháng • Gia hạn 30/06/2026</p><button class="btn btn-primary">Nâng cấp gói</button></div></div>
        <div class="account-panel ${state.accountTab === 'devices' ? 'active' : ''}">${['Laptop Windows','iPhone','Smart TV'].map(device => `<div class="device-item">${icon('monitor')}<strong>${device}</strong><button class="btn btn-ghost" style="margin-left:auto">Đăng xuất thiết bị</button></div>`).join('')}</div>
        <div class="account-panel ${state.accountTab === 'settings' ? 'active' : ''}"><div class="account-card"><p>Phụ đề mặc định: <strong>Tiếng Việt</strong></p><p>Chất lượng phát: <strong>Tự động 4K</strong></p><p>Ngôn ngữ giao diện: <strong>Tiếng Việt</strong></p><p>Autoplay tập tiếp theo: <strong>Bật</strong></p><button class="btn btn-danger">Đăng xuất</button></div></div>
      </section>
    </div>
  </div>`;
}
