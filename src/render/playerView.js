import { getCachedMovies } from '../data/movieRepository.js';
import { getState } from '../state/store.js';
import { escapeHTML } from '../utils/format.js';
import { imageFallbackAttr } from '../utils/imageFallback.js';
import { detailUrl, watchUrl } from '../utils/slug.js';
import { icon, movieById, renderMovieCard } from './layout.js';

export function renderPlayer(app) {
  const state = getState();
  const movies = getCachedMovies();
  const movie = state.currentMovie || movieById(state.selectedMovieId);
  const episodes = state.currentEpisodes?.length ? state.currentEpisodes : movie.episodes || [];
  const episode = episodes.find(ep => String(ep.id) === String(state.currentEpisodeId)) || episodes[0];
  const episodeIndex = episode ? episodes.findIndex(ep => String(ep.id) === String(episode.id)) : -1;
  const previousEpisode = episodeIndex > 0 ? episodes[episodeIndex - 1] : null;
  const nextEpisode = episodeIndex >= 0 && episodeIndex < episodes.length - 1 ? episodes[episodeIndex + 1] : null;

  app.innerHTML = `<div class="player-page">
    <section class="player-shell"><div class="player-box">
      <img src="${movie.backdrop}" alt="Player ${escapeHTML(movie.title)}" width="1920" height="1080" loading="eager" ${imageFallbackAttr('backdrop')}>
      <button class="play-big" aria-label="Phát phim">${icon('play')}</button>
      <div class="player-controls">
        <div class="timeline"><span></span></div>
        <div class="control-row">
          <div class="control-group"><button class="control-btn">${icon('play')}</button><button class="control-btn">${icon('skip-forward')}</button><button class="control-btn">${icon('volume-2')}</button><span class="time-label muted">15:42 / ${episode ? episode.duration : movie.duration}</span></div>
          <div class="control-group"><div class="player-menu-wrap"><button class="control-btn" onclick="togglePlayerMenu('sub-menu')">${icon('subtitles')}</button><div class="player-menu" id="sub-menu"><button>Tắt</button><button class="active">Tiếng Việt</button><button>English</button></div></div><div class="player-menu-wrap"><button class="control-btn" onclick="togglePlayerMenu('quality-menu')">${icon('settings')}</button><div class="player-menu" id="quality-menu"><button class="active">Auto</button><button>1080p</button><button>720p</button><button>480p</button></div></div><button class="control-btn">${icon('maximize')}</button></div>
        </div>
      </div>
    </div></section>
    <div class="container player-info">
      <div>
        <a class="btn btn-ghost" href="${detailUrl(movie)}">${icon('arrow-left')} Quay lại chi tiết phim</a>
        <h1>${escapeHTML(movie.title)}</h1>
        <p class="muted">${episode ? `Tập ${episode.number}: ${escapeHTML(episode.title)}` : movie.duration}</p>
        <div class="badges"><span class="badge">${movie.year}</span><span class="badge">${movie.quality}</span><span class="badge">${movie.age}</span><span class="badge">${movie.genres.join(', ')}</span></div>
        <p class="muted">${escapeHTML(movie.description)}</p>
        <div class="actions">
          ${previousEpisode ? `<a class="btn btn-ghost" href="${watchUrl(movie, previousEpisode.id)}">${icon('skip-back')} Tập trước</a>` : `<button class="btn btn-ghost" type="button" disabled>${icon('skip-back')} Tập trước</button>`}
          ${nextEpisode ? `<a class="btn btn-primary" href="${watchUrl(movie, nextEpisode.id)}">Tập tiếp theo ${icon('skip-forward')}</a>` : `<button class="btn btn-primary" type="button" disabled>Tập tiếp theo ${icon('skip-forward')}</button>`}
          <button class="btn btn-danger">${icon('alert-triangle')} Báo lỗi phim</button>
        </div>
      </div>
      <aside><h3>Danh sách tập</h3><div class="episode-list">${episodes.length ? episodes.map(ep => `<a class="episode-row ${String(ep.id) === String(state.currentEpisodeId) ? 'active' : ''}" href="${watchUrl(movie, ep.id)}"><strong>${String(ep.number).padStart(2,'0')}</strong><span>${escapeHTML(ep.title)} • ${ep.duration}</span>${String(ep.id) === String(state.currentEpisodeId) ? '<small>Đang xem</small>' : ''}</a>`).join('') : `<div class="empty-state"><span>${icon('film')}</span><strong>Phim lẻ</strong></div>`}</div></aside>
    </div>
    <div class="container section"><h2 class="section-title">Có thể bạn cũng thích</h2><div class="scroll-row">${movies.filter(item => String(item.id) !== String(movie.id)).slice(0,8).map(item => renderMovieCard(item)).join('')}</div></div>
  </div>`;
}
