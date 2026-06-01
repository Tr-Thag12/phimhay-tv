import {
  findCachedGenreBySlug,
  findCachedMovieById,
  getDataSource,
  getLastDataError,
  increaseMovieView,
  loadCategories,
  loadHomeMovies,
  loadMovieBySlug,
  loadMovieEpisodes,
  loadMovies,
  loadMoviesByCategory,
  searchMovies
} from '../data/movieRepository.js';
import { addHistoryItem } from '../features/history.js';
import { closeSearch } from '../features/search.js';
import { renderAccount } from '../render/accountView.js';
import { renderDetail as renderDetailView } from '../render/detailView.js';
import { renderHome } from '../render/homeView.js';
import { closeMobileMenu, closePlayerMenus, movieById, renderHeaderActive, toggleMobileMenu } from '../render/layout.js';
import { renderListing } from '../render/listingView.js';
import { renderNotFound } from '../render/notFoundView.js';
import { renderPlayer } from '../render/playerView.js';
import { renderSearchPage } from '../render/searchView.js';
import { getState } from '../state/store.js';
import { qs, createIcons } from '../utils/dom.js';
import { updateSeoMeta } from '../utils/seo.js';
import {
  detailUrl,
  episodeByRouteNumber,
  genreUrl,
  movieSlug,
  watchUrl
} from '../utils/slug.js';

const app = qs('#app');
const FILTER_ALL = 'Tất cả';
const DEFAULT_FILTERS = {
  genre: FILTER_ALL,
  country: FILTER_ALL,
  year: FILTER_ALL,
  type: FILTER_ALL,
  sort: 'Mới nhất',
  keyword: ''
};

function findMovieById(movieId) {
  return findCachedMovieById(movieId);
}

function setFilters(patch = {}) {
  const state = getState();
  Object.assign(state.filters, DEFAULT_FILTERS, patch);
}

function resetRouteState(page, activeRoute) {
  const state = getState();
  state.page = page;
  state.activeRoute = activeRoute;
  state.notFoundMessage = '';
}

function setNotFound(message) {
  const state = getState();
  state.page = 'notFound';
  state.activeRoute = '';
  state.notFoundMessage = message;
}

function listingTitle() {
  const state = getState();
  if (state.filters.genre !== FILTER_ALL) return `Thể loại ${state.filters.genre}`;
  if (state.filters.type !== FILTER_ALL) return state.filters.type;
  return 'Khám phá phim';
}

function activeRouteForMovie(movie) {
  return movie?.type === 'series' ? 'series' : 'movie';
}

function parseSegments(pathname) {
  return pathname
    .split('/')
    .filter(Boolean)
    .map(segment => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });
}

async function parseCurrentRoute() {
  const state = getState();
  const url = new URL(window.location.href);
  const segments = parseSegments(url.pathname);

  state.searchKeyword = '';
  state.routeMovies = [];
  state.searchResults = [];
  state.currentMovie = null;
  state.currentEpisodes = [];

  if (segments.length === 0) {
    resetRouteState('home', 'home');
    const data = await loadHomeMovies();
    state.routeMovies = data.movies;
    state.categories = data.categories;
    return;
  }

  if (segments.length === 1 && segments[0] === 'phim-le') {
    resetRouteState('listing', 'movie');
    state.routeMovies = await loadMovies({ type: 'MOVIE' });
    setFilters({ type: 'Phim lẻ' });
    return;
  }

  if (segments.length === 1 && segments[0] === 'phim-bo') {
    resetRouteState('listing', 'series');
    state.routeMovies = await loadMovies({ type: 'SERIES' });
    setFilters({ type: 'Phim bộ' });
    return;
  }

  if (segments.length === 1 && segments[0] === 'tai-khoan') {
    resetRouteState('account', 'account');
    const data = await loadHomeMovies();
    state.routeMovies = data.movies;
    state.categories = data.categories;
    return;
  }

  if (segments.length === 1 && segments[0] === 'tim-kiem') {
    const keyword = (url.searchParams.get('q') || '').trim();
    resetRouteState('search', 'search');
    state.searchKeyword = keyword;
    state.filters.keyword = keyword;
    state.searchResults = keyword ? await searchMovies(keyword) : [];
    return;
  }

  if (segments.length === 2 && segments[0] === 'the-loai') {
    await loadCategories();
    const genre = findCachedGenreBySlug(segments[1]);
    if (!genre) {
      setNotFound('Thể loại phim này không tồn tại trong dữ liệu mẫu.');
      return;
    }

    resetRouteState('listing', 'explore');
    setFilters({ genre });
    state.routeMovies = await loadMoviesByCategory(segments[1]);
    return;
  }

  if (segments.length === 2 && segments[0] === 'phim') {
    const movie = await loadMovieBySlug(segments[1]);
    if (!movie) {
      setNotFound('Không tìm thấy phim theo đường dẫn này.');
      return;
    }

    resetRouteState('detail', activeRouteForMovie(movie));
    state.selectedMovieId = movie.id;
    state.currentMovie = movie;
    state.currentEpisodes = movie.episodes || [];
    state.season = movie.episodes?.[0]?.season || 1;
    return;
  }

  if (segments.length === 3 && segments[0] === 'xem') {
    const movie = await loadMovieBySlug(segments[1]);
    const match = segments[2].match(/^tap-(\d+)$/);

    if (!movie) {
      setNotFound('Không tìm thấy phim theo đường dẫn xem này.');
      return;
    }

    if (!match) {
      setNotFound('Định dạng tập phim không hợp lệ.');
      return;
    }

    const episodes = await loadMovieEpisodes(segments[1], movie);
    movie.episodes = episodes;
    const episode = episodeByRouteNumber(movie, Number(match[1]));
    if (episode === undefined) {
      setNotFound(`Tập ${match[1]} không tồn tại trong dữ liệu mẫu của phim này.`);
      return;
    }

    resetRouteState('player', activeRouteForMovie(movie));
    state.selectedMovieId = movie.id;
    state.currentMovie = movie;
    state.currentEpisodes = episodes;
    state.currentEpisodeId = episode?.id || null;
    state.season = episode?.season || 1;
    addHistoryItem(movie.id, state.currentEpisodeId);
    increaseMovieView(movieSlug(movie));
    return;
  }

  setNotFound('Đường dẫn này không nằm trong các route hiện có của PhimHay TV.');
}

function updateMetaForCurrentRoute() {
  const state = getState();
  const canonicalPath = window.location.pathname || '/';
  const movie = state.currentMovie || findMovieById(state.selectedMovieId);

  if (state.page === 'home') {
    updateSeoMeta({
      title: 'PhimHay TV - Xem phim online',
      description: 'Xem phim online trên PhimHay TV với giao diện dark cinematic, dữ liệu phim mẫu và trải nghiệm frontend mock.',
      canonicalPath
    });
    return;
  }

  if (state.page === 'listing') {
    const title = `${listingTitle()} - PhimHay TV`;
    updateSeoMeta({
      title,
      description: `Danh sách ${listingTitle().toLowerCase()} trên PhimHay TV, lọc theo thể loại, quốc gia, năm phát hành và đánh giá.`,
      canonicalPath
    });
    return;
  }

  if (state.page === 'detail' && movie) {
    updateSeoMeta({
      title: `${movie.title} - PhimHay TV`,
      description: movie.description,
      canonicalPath
    });
    return;
  }

  if (state.page === 'player' && movie) {
    const episode = movie.episodes?.find(ep => ep.id === state.currentEpisodeId);
    const episodeLabel = episode ? `tập ${episode.number}` : 'tập 1';
    updateSeoMeta({
      title: `Xem ${movie.title} ${episodeLabel} - PhimHay TV`,
      description: `Đang xem ${movie.title} ${episodeLabel} trên PhimHay TV.`,
      canonicalPath
    });
    return;
  }

  if (state.page === 'search') {
    const keyword = state.searchKeyword.trim();
    updateSeoMeta({
      title: keyword ? `Tìm kiếm "${keyword}" - PhimHay TV` : 'Tìm kiếm - PhimHay TV',
      description: keyword ? `Kết quả tìm kiếm phim cho "${keyword}" trên PhimHay TV.` : 'Tìm phim theo tên, thể loại, quốc gia hoặc năm phát hành trên PhimHay TV.',
      canonicalPath
    });
    return;
  }

  if (state.page === 'account') {
    updateSeoMeta({
      title: 'Tài khoản - PhimHay TV',
      description: 'Trang tài khoản mock của PhimHay TV, gồm hồ sơ, danh sách lưu và lịch sử xem.',
      canonicalPath
    });
    return;
  }

  updateSeoMeta({
    title: 'Không tìm thấy trang - PhimHay TV',
    description: 'Đường dẫn không tồn tại trong frontend mock PhimHay TV.',
    canonicalPath
  });
}

function syncDataStatus() {
  const state = getState();
  state.dataSource = getDataSource();
  state.dataError = getLastDataError();
}

function renderLoading() {
  app.innerHTML = `<div class="container" style="padding-top:120px"><div class="empty-state"><span><i data-lucide="loader"></i></span><strong>Đang tải dữ liệu phim...</strong></div></div>`;
  createIcons();
}

export function render() {
  const state = getState();

  if (state.page === 'home') renderHome(app);
  if (state.page === 'listing') renderListing(app);
  if (state.page === 'detail') renderDetailView(app);
  if (state.page === 'player') renderPlayer(app);
  if (state.page === 'account') renderAccount(app);
  if (state.page === 'search') renderSearchPage(app);
  if (state.page === 'notFound') renderNotFound(app);

  createIcons();
}

export async function applyCurrentRoute(options = {}) {
  const { scroll = false } = options;
  const state = getState();

  state.isLoading = true;
  renderLoading();

  try {
    await parseCurrentRoute();
  } catch (error) {
    setNotFound('Không tải được dữ liệu cho đường dẫn này. Ứng dụng sẽ thử dùng dữ liệu mẫu nếu có.');
    console.error(error);
  } finally {
    state.isLoading = false;
    syncDataStatus();
  }

  renderHeaderActive(state.activeRoute);
  render();
  updateMetaForCurrentRoute();

  if (scroll) window.scrollTo(0, 0);
}

export function initCurrentRoute() {
  history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
  applyCurrentRoute();
}

export function navigateToUrl(path, options = {}) {
  const { replace = false, scroll = true } = options;
  const url = new URL(path, window.location.origin);
  const target = `${url.pathname}${url.search}`;
  const current = `${window.location.pathname}${window.location.search}`;

  closeSearch();
  closeMobileMenu();

  if (replace) {
    history.replaceState({}, '', target);
  } else if (target !== current) {
    history.pushState({}, '', target);
  }

  applyCurrentRoute({ scroll });
}

export function navigateTo(page, payload = {}) {
  const state = getState();

  if (page === 'home') {
    navigateToUrl('/');
    return;
  }

  if (page === 'account') {
    navigateToUrl('/tai-khoan');
    return;
  }

  if (page === 'detail') {
    const movie = findMovieById(payload.movieId || state.selectedMovieId);
    navigateToUrl(movie ? detailUrl(movie) : '/phim/khong-ton-tai');
    return;
  }

  if (page === 'player') {
    const movie = findMovieById(payload.movieId || state.selectedMovieId);
    navigateToUrl(movie ? watchUrl(movie, payload.episodeId || state.currentEpisodeId) : '/xem/khong-ton-tai/tap-1');
    return;
  }

  if (page === 'search') {
    navigateToSearch(payload.keyword || state.searchKeyword || state.filters.keyword || '');
    return;
  }

  if (page === 'listing') {
    const genre = payload.genre || (state.filters.genre !== FILTER_ALL ? state.filters.genre : '');
    const type = payload.type || state.filters.type;

    if (genre) {
      navigateToUrl(genreUrl(genre));
      return;
    }

    if (type === 'Phim bộ' || type === 'series') {
      navigateToUrl('/phim-bo');
      return;
    }

    navigateToUrl('/phim-le');
  }
}

export function navigateToHome() {
  navigateToUrl('/');
}

export function navigateToListing(type) {
  if (type === 'series' || type === 'Phim bộ') {
    navigateToUrl('/phim-bo');
    return;
  }

  navigateToUrl('/phim-le');
}

export function navigateToDetail(movieId) {
  navigateTo('detail', { movieId });
}

export function navigateToPlayer(movieId, episodeId) {
  playMovie(movieId, episodeId);
}

export function navigateToAccount() {
  navigateToUrl('/tai-khoan');
}

export function navigateToSearch(keyword = '') {
  const value = keyword.trim();
  navigateToUrl(value ? `/tim-kiem?q=${encodeURIComponent(value)}` : '/tim-kiem');
}

export function playMovie(movieId, episodeId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const movie = findMovieById(movieId);
  if (!movie) {
    navigateToUrl('/xem/khong-ton-tai/tap-1');
    return;
  }

  const targetEpisodeId = episodeId || movie.episodes?.[0]?.id || null;
  addHistoryItem(movie.id, targetEpisodeId);
  navigateToUrl(watchUrl(movie, targetEpisodeId));
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

function internalLinkTarget(anchor, event) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    anchor.target ||
    anchor.hasAttribute('download')
  ) {
    return null;
  }

  const href = anchor.getAttribute('href') || '';
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return null;

  const url = new URL(anchor.href);
  if (url.origin !== window.location.origin) return null;

  return `${url.pathname}${url.search}`;
}

export function initRouterEvents() {
  document.body.addEventListener('click', event => {
    const anchor = event.target.closest('a[href]');
    if (anchor) {
      const target = internalLinkTarget(anchor, event);
      if (target) {
        event.preventDefault();
        navigateToUrl(target);
        return;
      }
    }

    const pageBtn = event.target.closest('[data-page]');
    if (!pageBtn) return;

    if (pageBtn.dataset.listType) {
      navigateToListing(pageBtn.dataset.listType === 'series' ? 'series' : 'movie');
      return;
    }

    navigateTo(pageBtn.dataset.page);
  });

  window.addEventListener('popstate', () => {
    closeSearch();
    closeMobileMenu();
    applyCurrentRoute();
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
