import { movies } from '../data/movies.js';
import { getState } from '../state/store.js';
import { escapeHTML } from '../utils/format.js';
import { imageFallbackAttr } from '../utils/imageFallback.js';
import { icon, movieById, renderMovieCard } from './layout.js';

export function renderPlayer(app) {
  const state = getState();
  const movie = movieById(state.selectedMovieId);
  const episode = movie.episodes?.find(ep => ep.id === state.currentEpisodeId) || movie.episodes?.[0];

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
        <button class="btn btn-ghost" onclick="navigateTo('detail',{movieId:${movie.id}})">${icon('arrow-left')} Quay lại chi tiết phim</button>
        <h1>${escapeHTML(movie.title)}</h1>
        <p class="muted">${episode ? `Tập ${episode.number}: ${escapeHTML(episode.title)}` : movie.duration}</p>
        <div class="badges"><span class="badge">${movie.year}</span><span class="badge">${movie.quality}</span><span class="badge">${movie.age}</span><span class="badge">${movie.genres.join(', ')}</span></div>
        <p class="muted">${escapeHTML(movie.description)}</p>
        <div class="actions"><button class="btn btn-ghost">${icon('skip-back')} Tập trước</button><button class="btn btn-primary">Tập tiếp theo ${icon('skip-forward')}</button><button class="btn btn-danger">${icon('alert-triangle')} Báo lỗi phim</button></div>
      </div>
      <aside><h3>Danh sách tập</h3><div class="episode-list">${movie.episodes?.length ? movie.episodes.map(ep => `<div class="episode-row ${ep.id === state.currentEpisodeId ? 'active' : ''}" onclick="playMovie(${movie.id}, '${ep.id}')"><strong>${String(ep.number).padStart(2,'0')}</strong><span>${escapeHTML(ep.title)} • ${ep.duration}</span>${ep.id === state.currentEpisodeId ? '<small>Đang xem</small>' : ''}</div>`).join('') : `<div class="empty-state"><span>${icon('film')}</span><strong>Phim lẻ</strong></div>`}</div></aside>
    </div>
    <div class="container section"><h2 class="section-title">Có thể bạn cũng thích</h2><div class="scroll-row">${movies.filter(item => item.id !== movie.id).slice(0,8).map(item => renderMovieCard(item)).join('')}</div></div>
  </div>`;
}
