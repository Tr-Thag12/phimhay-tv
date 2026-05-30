import { movies } from '../data/movies.js';
import { qsa } from '../utils/dom.js';
import { escapeHTML } from '../utils/format.js';
import { imageFallbackAttr } from '../utils/imageFallback.js';
import { isSaved } from '../features/watchlist.js';

export function movieById(id) {
  return movies.find(movie => movie.id === Number(id)) || movies[0];
}

export function icon(name) {
  return `<i data-lucide="${name}"></i>`;
}

export function renderHeaderActive(page) {
  qsa('.nav-link').forEach(link => link.classList.remove('active'));

  if (page === 'home') {
    document.querySelector('[data-page="home"]')?.classList.add('active');
  } else if (['listing', 'detail', 'player'].includes(page)) {
    document.querySelector('[data-page="listing"]')?.classList.add('active');
  }
}

export function renderEmptyState(message, attrs = '') {
  return `<div class="empty-state"${attrs}><span>${icon('film')}</span><strong>${message}</strong></div>`;
}

export function renderMovieCard(movie) {
  const saved = isSaved(movie.id);

  return `
    <article class="movie-card" onclick="navigateTo('detail',{movieId:${movie.id}})">
      <img src="${movie.poster}" alt="Poster ${escapeHTML(movie.title)}" width="300" height="450" loading="lazy" decoding="async" ${imageFallbackAttr('poster')}>
      <div class="badges" style="position:absolute;top:9px;left:9px">
        <span class="badge ${movie.quality === '4K' ? 'red' : ''}">${movie.quality}</span>
        <span class="badge">${movie.age}</span>
      </div>
      <div class="movie-card-info">
        <h3 class="movie-card-title">${escapeHTML(movie.title)}</h3>
        <div class="movie-card-meta">${movie.year} • ${movie.genres[0]} • ${movie.rating}</div>
      </div>
      <div class="card-overlay">
        <div class="card-small-actions">
          <button class="round-btn red" type="button" aria-label="Xem phim" onclick="playMovie(${movie.id}, null, event)">${icon('play')}</button>
          <button class="round-btn ${saved ? 'active' : ''}" type="button" aria-label="${saved ? 'Bỏ lưu' : 'Lưu phim'}" onclick="toggleSave(${movie.id}, event)">${icon('bookmark')}</button>
        </div>
        <strong>${escapeHTML(movie.title)}</strong>
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
