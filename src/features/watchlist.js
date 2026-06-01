import { getStorage, setStorage } from '../utils/storage.js';

const WATCHLIST_KEY = 'phimhay_watchlist';
const DEFAULT_WATCHLIST = [1, 4, 11];

let onWatchlistChange = () => {};

export function setWatchlistChangeHandler(handler) {
  onWatchlistChange = typeof handler === 'function' ? handler : () => {};
}

export function getWatchlist() {
  return getStorage(WATCHLIST_KEY, DEFAULT_WATCHLIST);
}

export function setWatchlist(ids) {
  setStorage(WATCHLIST_KEY, ids);
}

export function isSaved(movieId) {
  return getWatchlist().some(id => String(id) === String(movieId));
}

export function toggleSave(movieId, event) {
  if (event) event.stopPropagation();

  const id = movieId;
  const ids = getWatchlist();
  const next = ids.some(item => String(item) === String(id))
    ? ids.filter(item => String(item) !== String(id))
    : [id, ...ids];

  setWatchlist(next);
  onWatchlistChange();
}
