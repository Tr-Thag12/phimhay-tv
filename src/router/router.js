import { addHistoryItem } from '../features/history.js';
import { closeSearch } from '../features/search.js';
import { renderAccount } from '../render/accountView.js';
import { renderDetail as renderDetailView } from '../render/detailView.js';
import { renderHome } from '../render/homeView.js';
import { closeMobileMenu, closePlayerMenus, movieById, renderHeaderActive, toggleMobileMenu } from '../render/layout.js';
import { renderListing } from '../render/listingView.js';
import { renderPlayer } from '../render/playerView.js';
import { getState } from '../state/store.js';
import { qs, createIcons } from '../utils/dom.js';

const app = qs('#app');

export function render() {
  const state = getState();

  if (state.page === 'home') renderHome(app);
  if (state.page === 'listing') renderListing(app);
  if (state.page === 'detail') renderDetailView(app);
  if (state.page === 'player') renderPlayer(app);
  if (state.page === 'account') renderAccount(app);

  createIcons();
}

export function navigateTo(page, payload = {}) {
  const state = getState();

  closeSearch();
  closeMobileMenu();
  if (payload.movieId) state.selectedMovieId = Number(payload.movieId);
  if (payload.episodeId) state.currentEpisodeId = payload.episodeId;
  state.page = page;
  renderHeaderActive(page);
  render();
  window.scrollTo(0, 0);
}

export function navigateToHome() {
  navigateTo('home');
}

export function navigateToListing(type) {
  const state = getState();
  if (type) state.filters.type = type;
  navigateTo('listing');
}

export function navigateToDetail(movieId) {
  navigateTo('detail', { movieId });
}

export function navigateToPlayer(movieId, episodeId) {
  playMovie(movieId, episodeId);
}

export function navigateToAccount() {
  navigateTo('account');
}

export function playMovie(movieId, episodeId, event) {
  if (event) event.stopPropagation();

  const state = getState();
  const movie = movieById(movieId);
  state.selectedMovieId = Number(movieId);
  state.currentEpisodeId = episodeId || movie.episodes?.[0]?.id || null;
  addHistoryItem(movieId, state.currentEpisodeId);
  navigateTo('player');
}

export function setDetailTab(tab) {
  const state = getState();
  state.detailTab = tab;
  renderDetailView(app);
  createIcons();
}

export function renderCurrentDetail() {
  renderDetailView(app);
  createIcons();
}

export function setAccountTab(tab) {
  const state = getState();
  state.accountTab = tab;
  renderAccount(app);
  createIcons();
}

export function initRouterEvents() {
  document.body.addEventListener('click', event => {
    const pageBtn = event.target.closest('[data-page]');
    if (!pageBtn) return;

    const state = getState();
    if (pageBtn.dataset.listType) {
      state.filters.type = pageBtn.dataset.listType === 'series' ? 'Phim bộ' : 'Phim lẻ';
    }
    navigateTo(pageBtn.dataset.page);
  });

  qs('#mobile-menu-btn')?.addEventListener('click', toggleMobileMenu);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeSearch();
      closeMobileMenu();
    }
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.player-menu-wrap')) closePlayerMenus();
  });
}
