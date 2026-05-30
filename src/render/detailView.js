import { movies } from '../data/movies.js';
import { getState } from '../state/store.js';
import { escapeHTML, stars, typeLabel } from '../utils/format.js';
import { imageFallbackAttr } from '../utils/imageFallback.js';
import { isSaved } from '../features/watchlist.js';
import { icon, movieById, renderMovieCard } from './layout.js';

export function renderDetail(app) {
  const state = getState();
  const movie = movieById(state.selectedMovieId);
  const seasons = [...new Set((movie.episodes || []).map(ep => ep.season))];
  const seasonEpisodes = (movie.episodes || []).filter(ep => ep.season === state.season);
  const similar = movies
    .filter(item => item.id !== movie.id && item.genres.some(genre => movie.genres.includes(genre)))
    .slice(0, 8);

  app.innerHTML = `<div class="detail-page">
    <section class="detail-hero"><img src="${movie.backdrop}" alt="Backdrop ${escapeHTML(movie.title)}" width="1920" height="1080" loading="eager" ${imageFallbackAttr('backdrop')}></section>
    <div class="container">
      <div class="detail-content">
        <img class="detail-poster" src="${movie.poster}" alt="Poster ${escapeHTML(movie.title)}" width="460" height="690" loading="eager" ${imageFallbackAttr('poster')}>
        <div class="detail-info">
          <div class="badges"><span class="badge red">TOP</span><span class="badge">${movie.quality}</span><span class="badge">${movie.age}</span><span class="badge gold">${movie.status}</span></div>
          <h1>${escapeHTML(movie.title)}</h1>
          <div class="rating-row"><span class="stars">${stars(movie.rating)}</span><strong>${movie.rating}</strong><span>IMDb ${movie.rating}</span><span>${movie.views} lượt xem</span></div>
          <div class="meta"><span>${movie.year}</span><span>•</span><span>${typeLabel(movie.type)}</span><span>•</span><span>${movie.duration}</span><span>•</span><span>${movie.genres.join(', ')}</span></div>
          <p class="muted">${escapeHTML(movie.description)}</p>
          <div class="actions">
            <button class="btn btn-primary" onclick="playMovie(${movie.id})">${icon('play')} Xem ngay</button>
            <button class="btn btn-ghost" onclick="setDetailTab('trailer')">${icon('film')} Trailer</button>
            <button class="btn btn-ghost" onclick="toggleSave(${movie.id}, event)">${icon(isSaved(movie.id) ? 'bookmark-check' : 'bookmark')} ${isSaved(movie.id) ? 'Đã lưu' : 'Thêm vào danh sách'}</button>
            <button class="btn btn-ghost">${icon('share-2')} Chia sẻ</button>
          </div>
          <div class="info-grid">
            <div><span>Đạo diễn</span><strong>${escapeHTML(movie.director)}</strong></div>
            <div><span>Quốc gia</span><strong>${escapeHTML(movie.country)}</strong></div>
            <div><span>Ngôn ngữ</span><strong>${escapeHTML(movie.language)}</strong></div>
            <div><span>Phụ đề</span><strong>${escapeHTML(movie.subtitle)}</strong></div>
            <div><span>Năm</span><strong>${movie.year}</strong></div>
            <div><span>Thời lượng</span><strong>${escapeHTML(movie.duration)}</strong></div>
            <div><span>Chất lượng</span><strong>${movie.quality}</strong></div>
            <div><span>Độ tuổi</span><strong>${movie.age}</strong></div>
          </div>
        </div>
      </div>
      <div class="tabs">
        ${['overview:Tổng quan','episodes:Tập phim','trailer:Trailer','cast:Diễn viên','reviews:Đánh giá','similar:Phim tương tự'].map(item => { const [key,label] = item.split(':'); return `<button class="tab-btn ${state.detailTab === key ? 'active' : ''}" onclick="setDetailTab('${key}')">${label}</button>`; }).join('')}
      </div>
      <div class="tab-panel ${state.detailTab === 'overview' ? 'active' : ''}"><p class="muted" style="max-width:900px;line-height:1.75">${escapeHTML(movie.description)} Đây là phần mô tả tổng quan để bạn có thể thay bằng nội dung thật từ database/API sau này.</p></div>
      <div class="tab-panel ${state.detailTab === 'episodes' ? 'active' : ''}">
        ${seasons.length ? `<select class="select" style="max-width:180px;margin-bottom:16px" onchange="state.season=Number(this.value);renderDetail();createIcons();">${seasons.map(season => `<option value="${season}" ${state.season === season ? 'selected' : ''}>Phần ${season}</option>`).join('')}</select>
        <div class="episode-grid">${seasonEpisodes.map(ep => `<article class="episode-card ${ep.id === state.currentEpisodeId ? 'active' : ''}" onclick="playMovie(${movie.id}, '${ep.id}')"><img src="${ep.thumb}" alt="Tập ${ep.number}" width="260" height="146" loading="lazy" decoding="async" ${imageFallbackAttr('backdrop')}><div><strong>Tập ${ep.number}: ${escapeHTML(ep.title)}</strong><p class="muted">${ep.duration}</p></div></article>`).join('')}</div>` : '<div class="empty-state"><span>' + icon('film') + '</span><strong>Phim lẻ không có danh sách tập.</strong></div>'}
      </div>
      <div class="tab-panel ${state.detailTab === 'trailer' ? 'active' : ''}"><div class="video-preview"><img src="${movie.trailer}" alt="Trailer ${escapeHTML(movie.title)}" width="1280" height="720" loading="lazy" decoding="async" ${imageFallbackAttr('backdrop')}><button class="play-big" aria-label="Phát trailer">${icon('play')}</button></div></div>
      <div class="tab-panel ${state.detailTab === 'cast' ? 'active' : ''}"><div class="cast-row">${(movie.cast?.length ? movie.cast : movies[0].cast).map(cast => `<article class="cast-card"><img src="${cast.photo}" alt="${escapeHTML(cast.name)}" width="160" height="160" loading="lazy" decoding="async" ${imageFallbackAttr('avatar')}><strong>${escapeHTML(cast.name)}</strong><p class="muted">${escapeHTML(cast.role)}</p></article>`).join('')}</div></div>
      <div class="tab-panel ${state.detailTab === 'reviews' ? 'active' : ''}"><div class="review-list"><div class="account-card"><h2>${movie.rating}/10</h2><p class="stars">${stars(movie.rating)}</p><button class="btn btn-ghost">${icon('edit-3')} Viết đánh giá</button></div>${(movie.reviews?.length ? movie.reviews : movies[0].reviews).map(review => `<div class="review-card"><strong>${escapeHTML(review.user)}</strong> <span class="stars">${stars(review.rating * 2)}</span><p class="muted">${escapeHTML(review.text)}</p><small class="muted">${review.time}</small></div>`).join('')}</div></div>
      <div class="tab-panel ${state.detailTab === 'similar' ? 'active' : ''}"><div class="scroll-row">${similar.map(item => renderMovieCard(item)).join('')}</div></div>
    </div>
  </div>`;
}
