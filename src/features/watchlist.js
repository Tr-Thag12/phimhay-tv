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
  return getWatchlist().includes(Number(movieId));
}

export function toggleSave(movieId, event) {
  if (event) event.stopPropagation();

  const id = Number(movieId);
  const ids = getWatchlist();
  const next = ids.includes(id) ? ids.filter(item => item !== id) : [id, ...ids];

  setWatchlist(next);
  onWatchlistChange();
}
