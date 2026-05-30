import { movies, user } from './data/movies.js';
import { initSearch } from './features/search.js';
import { setWatchlistChangeHandler, toggleSave } from './features/watchlist.js';
import {
  initRouterEvents,
  navigateTo,
  navigateToAccount,
  navigateToDetail,
  navigateToHome,
  navigateToListing,
  navigateToPlayer,
  playMovie,
  render,
  renderCurrentDetail,
  setAccountTab,
  setDetailTab
} from './router/router.js';
import { state } from './state/store.js';
import { createIcons } from './utils/dom.js';
import { renderHeaderActive, togglePlayerMenu } from './render/layout.js';

window.MOVIES = movies;
window.USER = user;
Object.assign(window, {
  state,
  navigateTo,
  navigateToHome,
  navigateToListing,
  navigateToDetail,
  navigateToPlayer,
  navigateToAccount,
  toggleSave,
  playMovie,
  setDetailTab,
  togglePlayerMenu,
  setAccountTab,
  renderDetail: renderCurrentDetail,
  createIcons
});

setWatchlistChangeHandler(render);
initRouterEvents();
initSearch();
renderHeaderActive('home');
render();
