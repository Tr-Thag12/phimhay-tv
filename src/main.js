import { movies, user } from './data/movies.js';
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
import { createIcons } from './utils/dom.js';
import { togglePlayerMenu } from './render/layout.js';

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
initCurrentRoute();
