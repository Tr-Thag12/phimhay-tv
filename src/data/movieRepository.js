import { movies as mockMovies } from './movies.js';
import {
  fetchCategories,
  fetchMovieBySlug,
  fetchMovieEpisodes,
  fetchMovies,
  fetchMoviesByCategory,
  increaseMovieView as increaseMovieViewApi,
  searchMovies as searchMoviesApi
} from '../services/movieApi.js';
import { adaptCategories, adaptEpisode, adaptMovie, adaptMovies } from '../services/movieAdapter.js';
import { genreSlug, movieSlug, slugify } from '../utils/slug.js';

let cachedMovies = [...mockMovies];
let cachedCategories = mockCategories();
let dataSource = 'mock';
let lastError = null;

function mockCategories() {
  const counts = new Map();
  mockMovies.forEach(movie => {
    (movie.genres || []).forEach(genre => {
      counts.set(genre, (counts.get(genre) || 0) + 1);
    });
  });

  return [...counts.entries()].map(([name, movieCount]) => ({
    id: genreSlug(name),
    name,
    slug: genreSlug(name),
    movieCount
  }));
}

function markApi() {
  dataSource = 'api';
  lastError = null;
}

function markMock(error) {
  dataSource = 'mock';
  lastError = error || null;
}

function sameMovie(a, b) {
  return String(a.id) === String(b.id) || movieSlug(a) === movieSlug(b);
}

function stableMovieId(movie) {
  const mockMovie = mockMovies.find(item => movieSlug(item) === movieSlug(movie));
  if (!mockMovie) return movie;

  return {
    ...movie,
    apiId: movie.apiId || movie.id,
    id: mockMovie.id
  };
}

function mergeMovies(items = []) {
  const next = [...cachedMovies];

  items.map(stableMovieId).forEach(item => {
    const index = next.findIndex(movie => sameMovie(movie, item));
    if (index >= 0) {
      const previous = next[index];
      next[index] = {
        ...previous,
        ...item,
        cast: item.cast?.length ? item.cast : previous.cast,
        reviews: item.reviews?.length ? item.reviews : previous.reviews
      };
    }
    else next.push(item);
  });

  cachedMovies = next;
  return items.map(stableMovieId);
}

function localFilter(query = {}) {
  const keyword = slugify(query.q || query.keyword || '');
  const type = query.type === 'SERIES' ? 'series' : query.type === 'MOVIE' ? 'movie' : query.type;
  const category = query.category ? slugify(query.category) : '';
  const country = query.country ? slugify(query.country) : '';
  const year = query.year ? String(query.year) : '';

  return mockMovies.filter(movie => {
    const haystack = slugify([
      movie.title,
      movie.originalTitle,
      movie.country,
      movie.year,
      movie.director,
      ...(movie.genres || [])
    ].join(' '));
    const matchesKeyword = !keyword || haystack.includes(keyword);
    const matchesType = !type || movie.type === type;
    const matchesCategory = !category || (movie.genres || []).some(genre => genreSlug(genre) === category);
    const matchesCountry = !country || slugify(movie.country) === country;
    const matchesYear = !year || String(movie.year) === year;

    return matchesKeyword && matchesType && matchesCategory && matchesCountry && matchesYear;
  });
}

function sortLocal(items, sort) {
  const next = [...items];
  if (sort === 'popular') return next.sort((a, b) => parseFloat(b.views) - parseFloat(a.views));
  if (sort === 'rating') return next.sort((a, b) => b.rating - a.rating);
  return next.sort((a, b) => b.year - a.year);
}

export function getCachedMovies() {
  return cachedMovies.length ? cachedMovies : mockMovies;
}

export function getCachedCategories() {
  return cachedCategories.length ? cachedCategories : mockCategories();
}

export function getDataSource() {
  return dataSource;
}

export function getLastDataError() {
  return lastError;
}

export function findCachedMovieById(id) {
  return getCachedMovies().find(movie => String(movie.id) === String(id))
    || mockMovies.find(movie => String(movie.id) === String(id))
    || null;
}

export function findCachedMovieBySlug(slug) {
  const normalizedSlug = slugify(slug);
  return getCachedMovies().find(movie => movieSlug(movie) === normalizedSlug)
    || mockMovies.find(movie => movieSlug(movie) === normalizedSlug)
    || null;
}

export function findCachedGenreBySlug(slug) {
  const normalizedSlug = slugify(slug);
  const category = getCachedCategories().find(item => item.slug === normalizedSlug);
  if (category) return category.name;

  return mockCategories().find(item => item.slug === normalizedSlug)?.name || null;
}

export async function loadCategories() {
  try {
    const data = await fetchCategories();
    cachedCategories = adaptCategories(data.items || []);
    markApi();
  } catch (error) {
    cachedCategories = mockCategories();
    markMock(error);
  }

  return cachedCategories;
}

export async function loadMovies(query = {}) {
  try {
    const data = await fetchMovies({ page: 1, limit: 50, ...query });
    const items = adaptMovies(data.items || []);
    markApi();
    return mergeMovies(items);
  } catch (error) {
    markMock(error);
    return sortLocal(localFilter(query), query.sort);
  }
}

export async function loadHomeMovies() {
  const [movies, categories] = await Promise.all([
    loadMovies({ page: 1, limit: 50 }),
    loadCategories()
  ]);

  return { movies, categories };
}

export async function loadMoviesByCategory(slug, query = {}) {
  try {
    const data = await fetchMoviesByCategory(slug, { page: 1, limit: 50, ...query });
    const items = adaptMovies(data.items || []);
    if (data.category?.name) {
      const exists = cachedCategories.some(category => category.slug === data.category.slug);
      if (!exists) cachedCategories = [...cachedCategories, data.category];
    }
    markApi();
    return mergeMovies(items);
  } catch (error) {
    markMock(error);
    return sortLocal(localFilter({ ...query, category: slug }), query.sort);
  }
}

export async function loadMovieBySlug(slug) {
  try {
    const data = await fetchMovieBySlug(slug);
    const movie = adaptMovie(data.movie);
    markApi();
    return mergeMovies([movie])[0];
  } catch (error) {
    markMock(error);
    return findCachedMovieBySlug(slug);
  }
}

export async function loadMovieEpisodes(slug, movie) {
  try {
    const data = await fetchMovieEpisodes(slug);
    const episodes = (data.episodes || []).map(episode => adaptEpisode(episode, movie));
    const target = { ...movie, episodes };
    markApi();
    mergeMovies([target]);
    return episodes;
  } catch (error) {
    markMock(error);
    return movie?.episodes || [];
  }
}

export async function searchMovies(keyword = '') {
  const q = keyword.trim();
  if (!q) return [];

  try {
    const data = await searchMoviesApi({ q, page: 1, limit: 50 });
    const items = adaptMovies(data.items || []);
    markApi();
    return mergeMovies(items);
  } catch (error) {
    markMock(error);
    return localFilter({ q });
  }
}

export async function increaseMovieView(slug) {
  try {
    return await increaseMovieViewApi(slug);
  } catch (error) {
    lastError = error;
    return null;
  }
}
