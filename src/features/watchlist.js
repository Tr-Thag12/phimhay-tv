import {
  getWatchlist as getRepositoryWatchlist,
  isInWatchlist,
  setWatchlist as setRepositoryWatchlist,
  toggleWatchlist
} from '../data/userLibraryRepository.js';

let onWatchlistChange = () => {};

export function setWatchlistChangeHandler(handler) {
  onWatchlistChange = typeof handler === 'function' ? handler : () => {};
}

export function getWatchlist() {
  return getRepositoryWatchlist();
}

export function setWatchlist(ids) {
  setRepositoryWatchlist(ids);
}

export function isSaved(movieId) {
  return isInWatchlist(movieId);
}

export function toggleSave(movieId, event) {
  if (event) event.stopPropagation();

  toggleWatchlist(movieId).finally(() => {
    onWatchlistChange();
  });
}
