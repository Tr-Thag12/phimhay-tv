import { movies, user } from './data/movies.js';
import { refreshUserLibrary } from './data/userLibraryRepository.js';
import { initSearch, openSearch } from './features/search.js';
import { setWatchlistChangeHandler, toggleSave } from './features/watchlist.js';
import {
  initCurrentRoute,
  initRouterEvents,
  navigateTo,
  navigateToAccount,
  navigateToDetail,
  navigateToHome,
  navigateToListing,
  navigateToPlayer,
  navigateToSearch,
  playMovie,
  render,
  renderCurrentDetail,
  setAccountTab,
  setDetailTab
} from './router/router.js';
import { state } from './state/store.js';
import { initAuth, subscribeAuth } from './state/authStore.js';
import { createIcons } from './utils/dom.js';
import { renderHeaderAuth, togglePlayerMenu } from './render/layout.js';

window.MOVIES = movies;
window.USER = user;
Object.assign(window, {
  state,
  navigateTo,
  navigateToHome,
  navigateToListing,
  navigateToDetail,
  navigateToPlayer,
  navigateToSearch,
  navigateToAccount,
  toggleSave,
  playMovie,
  openSearch,
  setDetailTab,
  togglePlayerMenu,
  setAccountTab,
  renderDetail: renderCurrentDetail,
  createIcons
});

setWatchlistChangeHandler(render);
initRouterEvents();
initSearch();
subscribeAuth(async () => {
  await refreshUserLibrary();
  renderHeaderAuth();
  if (['account', 'home', 'detail', 'listing', 'player'].includes(state.page)) render();
});
renderHeaderAuth();

async function initApp() {
  await initAuth();
  await refreshUserLibrary();
  initCurrentRoute();
}

initApp();
