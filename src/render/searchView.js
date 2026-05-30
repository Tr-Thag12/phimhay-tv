import { movies } from '../data/movies.js';
import { getState } from '../state/store.js';
import { escapeHTML } from '../utils/format.js';
import { slugify } from '../utils/slug.js';
import { icon, renderEmptyState, renderMovieCard } from './layout.js';

function searchMovies(keyword) {
  const kw = slugify(keyword);
  if (!kw) return [];

  return movies.filter(movie => {
    const haystack = [
      movie.title,
      movie.originalTitle,
      movie.country,
      movie.year,
      movie.director,
      ...(movie.genres || [])
    ].join(' ');

    return slugify(haystack).includes(kw);
  });
}

export function renderSearchPage(app) {
  const state = getState();
  const keyword = state.searchKeyword || '';
  const results = searchMovies(keyword);

  app.innerHTML = `<div class="listing-page search-page container">
    <div class="section-head">
      <div>
        <h1 class="page-title">Tìm kiếm</h1>
        <p class="muted">${keyword ? `Kết quả cho "${escapeHTML(keyword)}"` : 'Nhập từ khóa để tìm phim theo tên, thể loại, quốc gia hoặc năm phát hành.'}</p>
      </div>
      <button class="btn btn-ghost" type="button" onclick="openSearch()">${icon('search')} Tìm từ khóa khác</button>
    </div>
    ${
      keyword
        ? `<div class="result-line"><span>Tìm thấy <strong>${results.length}</strong> phim</span><span>Từ khóa: ${escapeHTML(keyword)}</span></div>
          <div class="movie-grid">${results.map(movie => renderMovieCard(movie)).join('') || renderEmptyState('Không tìm thấy phim phù hợp.', ' style="grid-column:1/-1"')}</div>`
        : renderEmptyState('Hãy nhập từ khóa trong ô tìm kiếm để bắt đầu.', ' style="margin-top:28px"')
    }
  </div>`;
}
