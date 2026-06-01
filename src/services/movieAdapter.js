function minutesToDuration(minutes, fallback = 'Đang cập nhật') {
  const value = Number(minutes);
  return Number.isFinite(value) && value > 0 ? `${value} phút` : fallback;
}

function compactViews(value) {
  const views = Number(value || 0);
  if (views >= 1000000) return `${(views / 1000000).toFixed(1).replace('.0', '')}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1).replace('.0', '')}K`;
  return String(views);
}

function typeFromApi(type) {
  return type === 'SERIES' ? 'series' : 'movie';
}

function statusLabel(movie) {
  if (movie.status === 'PUBLISHED' && movie.type === 'SERIES') return 'Đang chiếu';
  if (movie.status === 'PUBLISHED') return 'Hoàn thành';
  return 'Đang cập nhật';
}

export function adaptEpisode(apiEpisode, movie = {}) {
  const number = Number(apiEpisode.episodeNumber || apiEpisode.number || 1);

  return {
    id: apiEpisode.id || `${movie.id || movie.slug}-tap-${number}`,
    season: 1,
    number,
    title: apiEpisode.title || `Tập ${number}`,
    duration: minutesToDuration(apiEpisode.durationMinutes, movie.duration),
    progress: 0,
    thumb: apiEpisode.thumbnailUrl || movie.backdrop || movie.poster,
    videoUrl: apiEpisode.videoUrl || ''
  };
}

export function adaptMovie(apiMovie, episodes = apiMovie?.episodes || []) {
  if (!apiMovie) return null;

  const type = typeFromApi(apiMovie.type);
  const adaptedEpisodes = episodes.map(episode => adaptEpisode(episode, {
    id: apiMovie.id,
    slug: apiMovie.slug,
    poster: apiMovie.posterUrl,
    backdrop: apiMovie.backdropUrl,
    duration: minutesToDuration(apiMovie.durationMinutes)
  }));
  const genres = (apiMovie.categories || []).map(category => category.name).filter(Boolean);
  const duration = type === 'series' && adaptedEpisodes.length > 1
    ? `${adaptedEpisodes.length} tập × ${apiMovie.durationMinutes || '?'}p`
    : minutesToDuration(apiMovie.durationMinutes);

  return {
    id: apiMovie.id,
    title: apiMovie.title || 'Phim chưa có tên',
    originalTitle: apiMovie.originalTitle || apiMovie.title || '',
    slug: apiMovie.slug,
    year: apiMovie.releaseYear || new Date().getFullYear(),
    type,
    status: statusLabel(apiMovie),
    country: apiMovie.country?.name || 'Đang cập nhật',
    genres: genres.length ? genres : ['Đang cập nhật'],
    age: apiMovie.ageRating || 'T13',
    quality: apiMovie.quality || 'HD',
    duration,
    rating: Number(apiMovie.ratingAverage || 0),
    views: compactViews(apiMovie.viewCount),
    director: 'Đang cập nhật',
    language: apiMovie.language || 'Đang cập nhật',
    subtitle: 'Việt',
    description: apiMovie.description || 'Nội dung phim đang được cập nhật.',
    poster: apiMovie.posterUrl || apiMovie.backdropUrl || '',
    backdrop: apiMovie.backdropUrl || apiMovie.posterUrl || '',
    trailer: apiMovie.backdropUrl || apiMovie.posterUrl || '',
    cast: [],
    episodes: adaptedEpisodes,
    reviews: []
  };
}

export function adaptMovies(apiMovies = []) {
  return apiMovies.map(movie => adaptMovie(movie)).filter(Boolean);
}

export function adaptCategories(apiCategories = []) {
  return apiCategories
    .map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      movieCount: category.movieCount || 0
    }))
    .filter(category => category.name);
}
