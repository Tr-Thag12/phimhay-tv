import { movies as allMovies } from '../data/movies.js';
import { getState } from '../state/store.js';
import { qs, qsa, createIcons } from '../utils/dom.js';
import { escapeHTML, typeLabel } from '../utils/format.js';
import { renderMovieCard } from './layout.js';

function filteredMovies() {
  const state = getState();
  const kw = state.filters.keyword.trim().toLowerCase();
  const movies = allMovies.filter(movie => {
    const matchKeyword = !kw || `${movie.title} ${movie.originalTitle} ${movie.genres.join(' ')} ${movie.country}`.toLowerCase().includes(kw);
    const matchGenre = state.filters.genre === 'Tất cả' || movie.genres.includes(state.filters.genre);
    const matchCountry = state.filters.country === 'Tất cả' || movie.country === state.filters.country;
    const matchYear = state.filters.year === 'Tất cả' || String(movie.year) === String(state.filters.year);
    const matchType = state.filters.type === 'Tất cả' || typeLabel(movie.type) === state.filters.type;
    return matchKeyword && matchGenre && matchCountry && matchYear && matchType;
  });

  if (state.filters.sort === 'Xem nhiều') movies.sort((a, b) => parseFloat(b.views) - parseFloat(a.views));
  else if (state.filters.sort === 'Đánh giá') movies.sort((a, b) => b.rating - a.rating);
  else movies.sort((a, b) => b.year - a.year);

  return movies;
}

function filterGroup(label, key, values) {
  const state = getState();
  return `<div class="filter-group"><span class="filter-label">${label}</span><div class="chips">${values.map(value => `<button class="chip ${state.filters[key] === value ? 'active' : ''}" type="button" data-filter-key="${key}" data-filter-value="${value}">${value}</button>`).join('')}</div></div>`;
}

export function renderListing(app) {
  const state = getState();
  const movies = filteredMovies();

  app.innerHTML = `<div class="listing-page container">
    <h1 class="page-title">Khám phá phim</h1>
    <p class="muted">Tìm kiếm bộ phim yêu thích theo thể loại, quốc gia, năm phát hành và đánh giá.</p>
    <div class="filter-box">
      <input class="filter-search" id="listing-search" type="search" placeholder="Tìm phim, diễn viên, thể loại..." value="${escapeHTML(state.filters.keyword)}">
      <div class="filter-grid" style="margin-top:16px">
        ${filterGroup('Thể loại','genre',['Tất cả','Hành động','Tình cảm','Kinh dị','Hài','Khoa học viễn tưởng','Cổ trang','Trinh thám','Thanh xuân'])}
        ${filterGroup('Quốc gia','country',['Tất cả','Việt Nam','Hàn Quốc','Trung Quốc','Mỹ','Nhật Bản'])}
        ${filterGroup('Năm','year',['Tất cả','2024','2023','2022','2021'])}
        ${filterGroup('Loại','type',['Tất cả','Phim lẻ','Phim bộ','Hoạt hình'])}
        ${filterGroup('Sắp xếp','sort',['Mới nhất','Xem nhiều','Đánh giá'])}
      </div>
    </div>
    <div class="result-line"><span>Tìm thấy <strong>${movies.length}</strong> phim</span><span>Đang lọc: ${state.filters.genre} • ${state.filters.country} • ${state.filters.year}</span></div>
    <div class="movie-grid">${movies.map(movie => renderMovieCard(movie)).join('') || '<div class="empty-state" style="grid-column:1/-1">Không tìm thấy phim phù hợp.</div>'}</div>
  </div>`;

  qs('#listing-search')?.addEventListener('input', event => {
    state.filters.keyword = event.target.value;
    renderListing(app);
    createIcons();
  });

  qsa('[data-filter-key]').forEach(btn => btn.addEventListener('click', () => {
    state.filters[btn.dataset.filterKey] = btn.dataset.filterValue;
    renderListing(app);
    createIcons();
  }));
}
