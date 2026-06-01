import {
  getHistory as getRepositoryHistory,
  saveHistory,
  setHistory as setRepositoryHistory
} from '../data/userLibraryRepository.js';

export function getHistory() {
  return getRepositoryHistory();
}

export function setHistory(items) {
  setRepositoryHistory(items);
}

export function addHistoryItem(movieId, episodeId) {
  return saveHistory(movieId, episodeId);
}
