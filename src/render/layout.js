import { findCachedMovieById, getCachedMovies } from '../data/movieRepository.js';
import { getAuthState } from '../state/authStore.js';
import { qsa } from '../utils/dom.js';
import { escapeHTML } from '../utils/format.js';
import { imageFallbackAttr } from '../utils/imageFallback.js';
import { detailUrl, watchUrl } from '../utils/slug.js';
import { isSaved } from '../features/watchlist.js';

export function movieById(id) {
  return findCachedMovieById(id) || getCachedMovies()[0];
}

export function icon(name) {
  return `<i data-lucide="${name}"></i>`;
}

export function renderHeaderActive(page) {
  qsa('.nav-link, .avatar-btn, [data-admin-link]').forEach(link => link.classList.remove('active'));

  if (page === 'home') {
    document.querySelector('[data-route="home"], [data-page="home"]')?.classList.add('active');
  } else if (page === 'movie') {
    document.querySelector('[data-route="movie"]')?.classList.add('active');
  } else if (page === 'series') {
    document.querySelector('[data-route="series"]')?.classList.add('active');
  } else if (page === 'explore' || ['listing', 'detail', 'player', 'search'].includes(page)) {
    document.querySelector('[data-route="explore"], [data-page="listing"]')?.classList.add('active');
  } else if (page === 'account') {
    document.querySelector('[data-route="account"]')?.classList.add('active');
  } else if (page === 'admin') {
    document.querySelector('[data-route="admin"]')?.classList.add('active');
  }
}

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

export function renderHeaderAuth() {
  const auth = getAuthState();
  const accountLink = document.querySelector('[data-route="account"]');
  const mobileAccountLink = document.querySelector('[data-mobile-account-link]');
  const adminLinks = qsa('[data-admin-link]');

  if (!accountLink) return;

  const user = auth.user;
  const isAdmin = auth.isAuthenticated && user?.role === 'ADMIN';
  const label = auth.isAuthenticated
    ? (user?.displayName || user?.email || 'Tài khoản')
    : 'Đăng nhập';

  accountLink.setAttribute('aria-label', label);
  accountLink.setAttribute('title', label);
  accountLink.classList.toggle('auth-active', auth.isAuthenticated);
  accountLink.classList.toggle('admin-active', user?.role === 'ADMIN');

  accountLink.innerHTML = auth.isAuthenticated
    ? `<span class="avatar-initials">${escapeHTML(userInitials(user))}</span>`
    : '<i data-lucide="user"></i>';

  if (mobileAccountLink) {
    mobileAccountLink.textContent = auth.isAuthenticated ? label : 'Đăng nhập';
  }

  adminLinks.forEach(link => {
    link.hidden = !isAdmin;
    link.setAttribute('aria-hidden', isAdmin ? 'false' : 'true');
  });

  if (window.lucide) window.lucide.createIcons();
}

export function renderEmptyState(message, attrs = '') {
  return `<div class="empty-state"${attrs}><span>${icon('film')}</span><strong>${message}</strong></div>`;
}

export function renderMovieCard(movie) {
  const saved = isSaved(movie.id);
  const movieId = JSON.stringify(movie.id);

  return `
    <article class="movie-card">
      <a class="movie-card-link" href="${detailUrl(movie)}" aria-label="Xem chi tiết ${escapeHTML(movie.title)}">
        <img src="${movie.poster}" alt="Poster ${escapeHTML(movie.title)}" width="300" height="450" loading="lazy" decoding="async" ${imageFallbackAttr('poster')}>
        <div class="badges" style="position:absolute;top:9px;left:9px">
          <span class="badge ${movie.quality === '4K' ? 'red' : ''}">${movie.quality}</span>
          <span class="badge">${movie.age}</span>
        </div>
        <div class="movie-card-info">
          <h3 class="movie-card-title">${escapeHTML(movie.title)}</h3>
          <div class="movie-card-meta">${movie.year} • ${movie.genres[0]} • ${movie.rating}</div>
        </div>
      </a>
      <div class="card-overlay">
        <div class="card-small-actions">
          <a class="round-btn red" href="${watchUrl(movie)}" aria-label="Xem phim">${icon('play')}</a>
          <button class="round-btn ${saved ? 'active' : ''}" type="button" aria-label="${saved ? 'Bỏ lưu' : 'Lưu phim'}" onclick='toggleSave(${movieId}, event)'>${icon('bookmark')}</button>
        </div>
        <a href="${detailUrl(movie)}"><strong>${escapeHTML(movie.title)}</strong></a>
        <small>${escapeHTML(movie.description.slice(0, 82))}...</small>
      </div>
    </article>`;
}

export function closeMobileMenu() {
  document.querySelector('#mobile-menu')?.classList.remove('open');
}

export function toggleMobileMenu() {
  document.querySelector('#mobile-menu')?.classList.toggle('open');
}

export function togglePlayerMenu(id) {
  qsa('.player-menu').forEach(menu => {
    if (menu.id !== id) menu.classList.remove('open');
  });
  document.getElementById(id)?.classList.toggle('open');
}

export function closePlayerMenus() {
  qsa('.player-menu').forEach(menu => menu.classList.remove('open'));
}
