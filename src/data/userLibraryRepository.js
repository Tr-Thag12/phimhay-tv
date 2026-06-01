import {
  addToMyWatchlist,
  clearMyHistory as clearMyBackendHistory,
  getMyHistory,
  getMyWatchlist,
  removeFromMyWatchlist,
  removeMyHistoryItem as removeMyBackendHistoryItem,
  saveMyHistory
} from '../services/userLibraryApi.js';
import { adaptMovie } from '../services/movieAdapter.js';
import { getAuthToken } from '../services/authStorage.js';
import { getStorage, setStorage } from '../utils/storage.js';
import { movieSlug } from '../utils/slug.js';
import {
  cacheMovies,
  findCachedMovieById,
  findCachedMovieBySlug
} from './movieRepository.js';

const WATCHLIST_KEY = 'phimhay_watchlist';
const HISTORY_KEY = 'phimhay_history';
const DEFAULT_WATCHLIST = [1, 4, 11];
const DEFAULT_HISTORY = [
  { movieId: 1, episodeId: 's1e1', progress: 65 },
  { movieId: 3, episodeId: null, progress: 30 }
];

const libraryState = {
  source: 'local',
  lastError: null,
  watchlistIds: getStorage(WATCHLIST_KEY, DEFAULT_WATCHLIST),
  historyItems: getStorage(HISTORY_KEY, DEFAULT_HISTORY)
};

function shouldUseBackend() {
  return Boolean(getAuthToken());
}

function warnFallback(area, error) {
  console.warn(`[PhimHay TV] Không đồng bộ được ${area}, dùng localStorage fallback.`, error);
}

function localWatchlist() {
  return getStorage(WATCHLIST_KEY, DEFAULT_WATCHLIST);
}

function localHistory() {
  return getStorage(HISTORY_KEY, DEFAULT_HISTORY);
}

function setLocalWatchlist(ids) {
  const next = [...new Set(ids.map(id => String(id)).filter(Boolean))];
  setStorage(WATCHLIST_KEY, next);
  libraryState.watchlistIds = next;
  return next;
}

function setLocalHistory(items) {
  setStorage(HISTORY_KEY, items);
  libraryState.historyItems = items;
  return items;
}

function setLocalLibrary(source = 'local', error = null) {
  libraryState.source = source;
  libraryState.lastError = error;
  libraryState.watchlistIds = localWatchlist();
  libraryState.historyItems = localHistory();
  return libraryState;
}

function resolveMovie(movieOrIdOrSlug) {
  if (movieOrIdOrSlug && typeof movieOrIdOrSlug === 'object') {
    return movieOrIdOrSlug;
  }

  return findCachedMovieById(movieOrIdOrSlug)
    || findCachedMovieBySlug(movieOrIdOrSlug)
    || null;
}

function frontendMovieId(movieOrIdOrSlug) {
  const movie = resolveMovie(movieOrIdOrSlug);
  if (movie?.id !== undefined && movie?.id !== null) return movie.id;
  return movieOrIdOrSlug;
}

function backendMovieId(movieOrIdOrSlug) {
  const movie = resolveMovie(movieOrIdOrSlug);
  if (movie?.apiId) return movie.apiId;
  if (!movie && typeof movieOrIdOrSlug === 'string' && !/^\d+$/.test(movieOrIdOrSlug)) {
    return movieOrIdOrSlug;
  }
  return typeof movie?.id === 'string' ? movie.id : '';
}

function resolveEpisode(movie, episodeOrId) {
  if (episodeOrId && typeof episodeOrId === 'object') return episodeOrId;
  return (movie?.episodes || []).find(episode => String(episode.id) === String(episodeOrId)) || null;
}

function backendEpisodeId(movie, episodeOrId) {
  if (!episodeOrId) return null;
  const episode = resolveEpisode(movie, episodeOrId);
  if (episode?.apiId) return episode.apiId;
  return typeof episode?.id === 'string' ? episode.id : typeof episodeOrId === 'string' ? episodeOrId : null;
}

function episodeIdForUi(movie, episodeOrId) {
  const episode = resolveEpisode(movie, episodeOrId);
  return episode?.id || episodeOrId || null;
}

function adaptBackendMovie(apiMovie) {
  const adaptedMovie = adaptMovie(apiMovie);
  return cacheMovies(adaptedMovie ? [adaptedMovie] : [])[0] || adaptedMovie;
}

function progressPercent(progressSeconds = 0, durationSeconds = 0) {
  const progress = Number(progressSeconds || 0);
  const duration = Number(durationSeconds || 0);
  if (duration > 0) return Math.max(0, Math.min(100, Math.round((progress / duration) * 100)));
  return progress > 0 ? 1 : 0;
}

function parseDurationSeconds(episode) {
  const minutes = Number.parseInt(episode?.durationMinutes || '', 10);
  if (Number.isFinite(minutes) && minutes > 0) return minutes * 60;

  const duration = String(episode?.duration || '');
  const match = duration.match(/(\d+)/);
  if (!match) return 0;
  return Number.parseInt(match[1], 10) * 60;
}

function historyPayloadFromUi(movieOrId, episodeOrId, progress = null) {
  const movie = resolveMovie(movieOrId);
  const backendId = backendMovieId(movie || movieOrId);
  const episode = resolveEpisode(movie, episodeOrId);
  const durationSeconds = parseDurationSeconds(episode);
  const progressValue = progress !== null && progress !== undefined && Number.isFinite(Number(progress))
    ? Number(progress)
    : episodeOrId ? 12 : 0;
  const progressSeconds = durationSeconds > 0
    ? Math.round(durationSeconds * (Math.max(0, Math.min(100, progressValue)) / 100))
    : Math.max(0, Math.round(progressValue));

  return {
    movie,
    backendId,
    payload: {
      movieId: backendId,
      episodeId: backendEpisodeId(movie, episodeOrId),
      progressSeconds,
      durationSeconds: durationSeconds || null
    },
    localItem: {
      movieId: frontendMovieId(movie || movieOrId),
      episodeId: episodeIdForUi(movie, episodeOrId),
      progress: Math.max(0, Math.min(100, Math.round(progressValue)))
    }
  };
}

function backendWatchlistItem(item) {
  const movie = adaptBackendMovie(item.movie);
  return movie?.id;
}

function backendHistoryItem(item) {
  const movie = adaptBackendMovie(item.movie);
  const episodeId = item.episode?.id || item.episodeId || null;

  return {
    id: item.id,
    backendId: item.id,
    movieId: movie?.id || item.movieId,
    apiMovieId: item.movieId,
    episodeId,
    progress: progressPercent(item.progressSeconds, item.durationSeconds),
    progressSeconds: item.progressSeconds,
    durationSeconds: item.durationSeconds,
    watchedAt: item.watchedAt,
    lastWatchedAt: item.lastWatchedAt || item.watchedAt,
    movie,
    episode: item.episode
  };
}

function useLocalWatchlistMutation(nextIds, source = 'local') {
  libraryState.source = source;
  libraryState.lastError = null;
  return setLocalWatchlist(nextIds);
}

function useLocalHistoryMutation(nextItems, source = 'local') {
  libraryState.source = source;
  libraryState.lastError = null;
  return setLocalHistory(nextItems);
}

export function getUserLibraryStatus() {
  return {
    source: libraryState.source,
    isBackendSynced: libraryState.source === 'backend',
    isLocalFallback: libraryState.source !== 'backend',
    lastError: libraryState.lastError
  };
}

export async function refreshUserLibrary() {
  if (!shouldUseBackend()) {
    return setLocalLibrary('local');
  }

  try {
    const [watchlistData, historyData] = await Promise.all([
      getMyWatchlist(),
      getMyHistory({ limit: 100 })
    ]);

    libraryState.watchlistIds = (watchlistData.items || [])
      .map(backendWatchlistItem)
      .filter(id => id !== undefined && id !== null);
    libraryState.historyItems = (historyData.items || [])
      .map(backendHistoryItem)
      .filter(item => item.movieId);
    libraryState.source = 'backend';
    libraryState.lastError = null;
  } catch (error) {
    warnFallback('watchlist/history', error);
    setLocalLibrary('local-fallback', error);
  }

  return libraryState;
}

export function getWatchlist() {
  return libraryState.watchlistIds;
}

export function setWatchlist(ids) {
  return useLocalWatchlistMutation(ids);
}

export function isInWatchlist(movieIdOrSlug) {
  const movie = resolveMovie(movieIdOrSlug);
  const targetIds = [
    movie?.id,
    movie?.apiId,
    typeof movieIdOrSlug === 'string' ? movieIdOrSlug : null
  ].filter(id => id !== undefined && id !== null);
  const targetSlug = movie ? movieSlug(movie) : typeof movieIdOrSlug === 'string' ? movieIdOrSlug : '';

  return libraryState.watchlistIds.some(id => {
    if (targetIds.some(targetId => String(targetId) === String(id))) return true;
    const savedMovie = resolveMovie(id);
    return savedMovie && targetSlug && movieSlug(savedMovie) === targetSlug;
  });
}

export async function addWatchlist(movieOrId) {
  const localId = frontendMovieId(movieOrId);
  const backendId = backendMovieId(movieOrId);

  if (shouldUseBackend() && backendId) {
    try {
      const data = await addToMyWatchlist(backendId);
      const itemId = backendWatchlistItem(data.item);
      if (itemId && !libraryState.watchlistIds.some(id => String(id) === String(itemId))) {
        libraryState.watchlistIds = [itemId, ...libraryState.watchlistIds];
      }
      libraryState.source = 'backend';
      libraryState.lastError = null;
      return libraryState;
    } catch (error) {
      warnFallback('watchlist', error);
      libraryState.lastError = error;
    }
  }

  if (localId === undefined || localId === null) return libraryState;
  const next = [
    localId,
    ...localWatchlist().filter(id => String(id) !== String(localId))
  ];
  useLocalWatchlistMutation(next, shouldUseBackend() ? 'local-fallback' : 'local');
  return libraryState;
}

export async function removeWatchlist(movieIdOrSlug) {
  const localId = frontendMovieId(movieIdOrSlug);
  const backendId = backendMovieId(movieIdOrSlug);

  if (shouldUseBackend() && backendId) {
    try {
      await removeFromMyWatchlist(backendId);
      libraryState.watchlistIds = libraryState.watchlistIds
        .filter(id => String(id) !== String(localId) && String(id) !== String(backendId));
      libraryState.source = 'backend';
      libraryState.lastError = null;
      return libraryState;
    } catch (error) {
      warnFallback('watchlist', error);
      libraryState.lastError = error;
    }
  }

  const next = localWatchlist().filter(id => String(id) !== String(localId));
  useLocalWatchlistMutation(next, shouldUseBackend() ? 'local-fallback' : 'local');
  return libraryState;
}

export async function toggleWatchlist(movieOrId) {
  if (isInWatchlist(movieOrId)) {
    return removeWatchlist(movieOrId);
  }

  return addWatchlist(movieOrId);
}

export function getHistory() {
  return libraryState.historyItems;
}

export function setHistory(items) {
  return useLocalHistoryMutation(items);
}

export async function saveHistory(movieOrId, episodeOrId = null, progress = null) {
  const { backendId, payload, localItem } = historyPayloadFromUi(movieOrId, episodeOrId, progress);

  if (shouldUseBackend() && backendId) {
    try {
      const data = await saveMyHistory(payload);
      const nextItem = backendHistoryItem(data.item);
      libraryState.historyItems = [
        nextItem,
        ...libraryState.historyItems.filter(item =>
          String(item.backendId || item.id) !== String(nextItem.backendId || nextItem.id)
            && !(String(item.movieId) === String(nextItem.movieId)
              && String(item.episodeId || '') === String(nextItem.episodeId || ''))
        )
      ].slice(0, 100);
      libraryState.source = 'backend';
      libraryState.lastError = null;
      return libraryState;
    } catch (error) {
      warnFallback('history', error);
      libraryState.lastError = error;
    }
  }

  const next = [
    localItem,
    ...localHistory().filter(item => String(item.movieId) !== String(localItem.movieId))
  ].slice(0, 8);
  useLocalHistoryMutation(next, shouldUseBackend() ? 'local-fallback' : 'local');
  return libraryState;
}

export async function removeHistoryItem(id) {
  const item = libraryState.historyItems.find(historyItem =>
    String(historyItem.id || historyItem.backendId || historyItem.movieId) === String(id)
  );
  const backendId = item?.backendId || item?.id;

  if (shouldUseBackend() && backendId) {
    try {
      await removeMyBackendHistoryItem(backendId);
      libraryState.historyItems = libraryState.historyItems
        .filter(historyItem => String(historyItem.backendId || historyItem.id) !== String(backendId));
      libraryState.source = 'backend';
      libraryState.lastError = null;
      return libraryState;
    } catch (error) {
      warnFallback('history', error);
      libraryState.lastError = error;
    }
  }

  useLocalHistoryMutation(
    localHistory().filter(historyItem => String(historyItem.movieId) !== String(id)),
    shouldUseBackend() ? 'local-fallback' : 'local'
  );
  return libraryState;
}

export async function clearHistory() {
  if (shouldUseBackend()) {
    try {
      await clearMyBackendHistory();
      libraryState.historyItems = [];
      libraryState.source = 'backend';
      libraryState.lastError = null;
      return libraryState;
    } catch (error) {
      warnFallback('history', error);
      libraryState.lastError = error;
    }
  }

  useLocalHistoryMutation([], shouldUseBackend() ? 'local-fallback' : 'local');
  return libraryState;
}
