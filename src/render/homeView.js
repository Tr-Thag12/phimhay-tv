import { movies } from '../data/movies.js';
import { getHistory } from '../features/history.js';
import { escapeHTML, typeLabel } from '../utils/format.js';
import { imageFallbackAttr } from '../utils/imageFallback.js';
import { detailUrl, genreUrl, watchUrl } from '../utils/slug.js';
import { icon, movieById, renderEmptyState, renderMovieCard } from './layout.js';

export function renderHome(app) {
  const hero = movies[0];
  const continueItems = getHistory()
    .map(item => ({ ...item, movie: movieById(item.movieId) }))
    .filter(item => item.movie);
  const top = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const newest = [...movies].sort((a, b) => b.year - a.year).slice(0, 8);

  app.innerHTML = `
    <section class="hero">
      <img class="hero-bg" src="${hero.backdrop}" alt="Backdrop ${escapeHTML(hero.title)}" width="1920" height="1080" loading="eager" fetchpriority="high" ${imageFallbackAttr('backdrop')}>
      <div class="hero-content">
        <img class="hero-poster" src="${hero.poster}" alt="Poster ${escapeHTML(hero.title)}" width="360" height="540" loading="eager" ${imageFallbackAttr('poster')}>
        <div>
          <div class="badges"><span class="badge red">TOP 1</span><span class="badge">${hero.quality}</span><span class="badge">${hero.age}</span><span class="badge gold">${hero.status}</span></div>
          <h1>${escapeHTML(hero.title)}</h1>
          <div class="meta"><span>${hero.year}</span><span>•</span><span>${typeLabel(hero.type)}</span><span>•</span><span>${hero.duration}</span><span>•</span><span>${hero.genres.join(', ')}</span></div>
          <p>${escapeHTML(hero.description)}</p>
          <div class="actions">
            <a class="btn btn-primary" href="${watchUrl(hero)}">${icon('play')} Xem ngay</a>
            <a class="btn btn-ghost" href="${detailUrl(hero)}">${icon('film')} Chi tiết</a>
            <button class="btn btn-ghost" type="button" onclick="toggleSave(${hero.id}, event)">${icon('plus')} Danh sách</button>
          </div>
        </div>
      </div>
    </section>
    <div class="container">
      <section class="section">
        <div class="section-head"><h2 class="section-title">Tiếp tục xem</h2></div>
        <div class="scroll-row">
          ${continueItems.length ? continueItems.map(item => `
          <a class="wide-card" href="${watchUrl(item.movie, item.episodeId)}">
            <img src="${item.movie.backdrop}" alt="${escapeHTML(item.movie.title)}" width="640" height="360" loading="lazy" decoding="async" ${imageFallbackAttr('backdrop')}>
            <div class="progress"><span style="width:${item.progress}%"></span></div>
            <div class="card-overlay" style="opacity:0">${icon('play')}<strong>${escapeHTML(item.movie.title)}</strong><small>Đã xem ${item.progress}%</small></div>
          </a>`).join('') : renderEmptyState('Bạn chưa xem phim nào.')}
        </div>
      </section>
      <section class="section">
        <div class="section-head"><h2 class="section-title">Top 10 thịnh hành</h2></div>
        <div class="scroll-row">${top.map((movie, i) => `<a class="top-card" href="${detailUrl(movie)}" aria-label="Xem chi tiết ${escapeHTML(movie.title)}"><span class="top-number">${i + 1}</span><img src="${movie.poster}" alt="${escapeHTML(movie.title)}" width="260" height="390" loading="lazy" decoding="async" ${imageFallbackAttr('poster')}></a>`).join('')}</div>
      </section>
      <section class="section">
        <div class="section-head"><h2 class="section-title">Phim mới cập nhật</h2><a class="btn btn-ghost" href="/phim-le">Xem tất cả</a></div>
        <div class="scroll-row">${newest.map(movie => renderMovieCard(movie)).join('')}</div>
      </section>
      <section class="section">
        <div class="section-head"><h2 class="section-title">Khám phá theo thể loại</h2></div>
        <div class="chips">${['Hành động','Tình cảm','Kinh dị','Hài','Khoa học viễn tưởng','Cổ trang','Trinh thám'].map(genre => `<a class="chip" href="${genreUrl(genre)}">${genre}</a>`).join('')}</div>
      </section>
    </div>`;
}
