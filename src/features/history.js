import { getStorage, setStorage } from '../utils/storage.js';

const HISTORY_KEY = 'phimhay_history';
const DEFAULT_HISTORY = [
  { movieId: 1, episodeId: 's1e1', progress: 65 },
  { movieId: 3, episodeId: null, progress: 30 }
];

export function getHistory() {
  return getStorage(HISTORY_KEY, DEFAULT_HISTORY);
}

export function setHistory(items) {
  setStorage(HISTORY_KEY, items);
}

export function addHistoryItem(movieId, episodeId) {
  const id = movieId;
  const history = getHistory().filter(item => String(item.movieId) !== String(id));
  setHistory([
    {
      movieId: id,
      episodeId,
      progress: episodeId ? 12 : 0
    },
    ...history
  ].slice(0, 8));
}
