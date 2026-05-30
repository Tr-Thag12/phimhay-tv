import { movies } from '../data/movies.js';
import { qs, createIcons } from '../utils/dom.js';
import { escapeHTML } from '../utils/format.js';
import { imageFallbackAttr } from '../utils/imageFallback.js';

export function openSearch() {
  qs('#search-overlay')?.classList.add('open');
  qs('#search-input')?.focus();
  renderSearchResults('');
}

export function closeSearch() {
  qs('#search-overlay')?.classList.remove('open');
}

export function renderSearchResults(keyword = '') {
  const kw = keyword.trim().toLowerCase();
  const results = movies
    .filter(movie => !kw || `${movie.title} ${movie.genres.join(' ')} ${movie.country}`.toLowerCase().includes(kw))
    .slice(0, 6);
  const searchResults = qs('#search-results');

  if (!searchResults) return;

  searchResults.innerHTML = results.map(movie => `<article class="movie-card" onclick="navigateTo('detail',{movieId:${movie.id}})"><img src="${movie.poster}" alt="${escapeHTML(movie.title)}" width="220" height="330" loading="lazy" decoding="async" ${imageFallbackAttr('poster')}><div class="movie-card-info"><h3 class="movie-card-title">${escapeHTML(movie.title)}</h3><div class="movie-card-meta">${movie.year} • ${movie.quality}</div></div></article>`).join('') || '<div class="empty-state"><span><i data-lucide="search-x"></i></span><strong>Không có kết quả.</strong></div>';
  createIcons();
}

export function initSearch() {
  qs('#open-search')?.addEventListener('click', openSearch);
  qs('#close-search')?.addEventListener('click', closeSearch);
  qs('#search-input')?.addEventListener('input', event => renderSearchResults(event.target.value));

  document.body.addEventListener('click', event => {
    const suggestion = event.target.closest('[data-search]');
    if (!suggestion) return;

    const searchInput = qs('#search-input');
    if (searchInput) searchInput.value = suggestion.dataset.search;
    renderSearchResults(suggestion.dataset.search);
  });
}
