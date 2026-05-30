import { movies } from '../data/movies.js';

export function slugify(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function movieSlug(movie) {
  return movie?.slug || slugify(movie?.title || movie?.name || movie?.originalTitle || '');
}

export function genreSlug(genre) {
  return slugify(genre);
}

export function findMovieBySlug(slug) {
  const normalizedSlug = slugify(slug);
  return movies.find(movie => movieSlug(movie) === normalizedSlug) || null;
}

export function allGenres() {
  return [...new Set(movies.flatMap(movie => movie.genres || []))];
}

export function findGenreBySlug(slug) {
  const normalizedSlug = slugify(slug);
  return allGenres().find(genre => genreSlug(genre) === normalizedSlug) || null;
}

export function detailUrl(movie) {
  return `/phim/${movieSlug(movie)}`;
}

export function episodeRouteNumber(movie, episodeId) {
  const episodes = movie?.episodes || [];
  if (!episodes.length) return 1;

  const index = episodes.findIndex(ep => ep.id === episodeId);
  return index >= 0 ? index + 1 : 1;
}

export function episodeByRouteNumber(movie, routeNumber) {
  const episodes = movie?.episodes || [];
  const number = Number(routeNumber);

  if (!Number.isInteger(number) || number < 1) return null;
  if (!episodes.length) return number === 1 ? null : undefined;

  return episodes[number - 1] || undefined;
}

export function watchUrl(movie, episodeId) {
  return `/xem/${movieSlug(movie)}/tap-${episodeRouteNumber(movie, episodeId)}`;
}

export function genreUrl(genre) {
  return `/the-loai/${genreSlug(genre)}`;
}
