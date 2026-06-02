import {
  createAdminMovie,
  getAdminMovieById,
  getAdminMovies,
  softDeleteAdminMovie,
  updateAdminMovie,
  updateAdminMovieFeatured,
  updateAdminMoviePublish
} from '../services/adminMovieApi.js';
import { ApiError } from '../services/apiClient.js';
import { fetchCategories } from '../services/movieApi.js';
import { createIcons } from '../utils/dom.js';
import { escapeHTML } from '../utils/format.js';
import { slugify } from '../utils/slug.js';
import { icon } from './layout.js';

const ADMIN_BACKEND_OFFLINE_MESSAGE =
  'Không kết nối được backend admin. Hãy chạy backend local.';

const MOVIE_TYPES = [
  ['', 'Tất cả loại'],
  ['MOVIE', 'Phim lẻ'],
  ['SERIES', 'Phim bộ']
];

const MOVIE_STATUS = [
  ['', 'Tất cả trạng thái'],
  ['DRAFT', 'Nháp'],
  ['PUBLISHED', 'Đã publish'],
  ['HIDDEN', 'Đã ẩn']
];

const SORT_OPTIONS = [
  ['newest', 'Mới nhất'],
  ['oldest', 'Cũ nhất'],
  ['popular', 'Lượt xem cao'],
  ['title', 'Tên phim']
];

const state = {
  root: null,
  didInit: false,
  isLoading: false,
  isSubmitting: false,
  error: '',
  success: '',
  filters: {
    q: '',
    isPublished: '',
    type: '',
    status: '',
    sort: 'newest'
  },
  page: 1,
  limit: 10,
  items: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  },
  categories: [],
  countryOptions: [],
  formMode: '',
  formMovie: null,
  formLoading: false,
  formError: '',
  detailMovie: null,
  detailLoading: false,
  detailError: ''
};

function adminErrorMessage(error) {
  if (error instanceof ApiError && error.status === 0) return ADMIN_BACKEND_OFFLINE_MESSAGE;
  return error?.message || ADMIN_BACKEND_OFFLINE_MESSAGE;
}

function normalizePagination(pagination = {}) {
  const totalPages = Math.max(Number(pagination.totalPages) || 1, 1);
  const page = Math.min(Math.max(Number(pagination.page) || state.page, 1), totalPages);

  return {
    page,
    limit: Number(pagination.limit) || state.limit,
    total: Number(pagination.total) || 0,
    totalPages
  };
}

function formatType(type) {
  if (type === 'MOVIE') return 'Phim lẻ';
  if (type === 'SERIES') return 'Phim bộ';
  return type || 'Chưa rõ';
}

function formatStatus(status) {
  if (status === 'PUBLISHED') return 'Đã publish';
  if (status === 'HIDDEN') return 'Đã ẩn';
  if (status === 'DRAFT') return 'Nháp';
  return status || 'Chưa rõ';
}

function formatNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number.toLocaleString('vi-VN') : '0';
}

function firstImage(movie) {
  return movie.posterUrl || movie.backdropUrl || '';
}

function collectCountryOptions(items = []) {
  const countries = new Map(state.countryOptions.map((country) => [country.id, country]));

  items.forEach((movie) => {
    if (!movie.country?.id) return;
    countries.set(movie.country.id, {
      id: movie.country.id,
      label: [movie.country.name, movie.country.code].filter(Boolean).join(' - ')
    });
  });

  state.countryOptions = [...countries.values()].sort((a, b) => a.label.localeCompare(b.label, 'vi'));
}

function categoryNames(movie) {
  return (movie.categories || []).map((category) => category.name || category.slug || category.id).filter(Boolean);
}

function categoryIds(movie) {
  return (movie.categories || []).map((category) => category.id).filter(Boolean);
}

function renderSelect(name, options, selectedValue, extra = '') {
  return `<select name="${escapeHTML(name)}" ${extra}>
    ${options.map(([value, label]) => `<option value="${escapeHTML(value)}" ${String(selectedValue) === String(value) ? 'selected' : ''}>${escapeHTML(label)}</option>`).join('')}
  </select>`;
}

function renderFeedback() {
  return `
    ${state.error ? `<div class="admin-movie-alert error">${icon('circle-alert')}<span>${escapeHTML(state.error)}</span></div>` : ''}
    ${state.success ? `<div class="admin-movie-alert success">${icon('circle-check')}<span>${escapeHTML(state.success)}</span></div>` : ''}
  `;
}

function renderToolbar() {
  return `<form class="admin-movie-toolbar" data-admin-movie-filter>
    <div class="admin-movie-toolbar-head">
      <div>
        <p class="eyebrow">Quản lý phim</p>
        <h2>Danh sách phim admin</h2>
      </div>
      <div class="admin-movie-actions">
        <button class="btn btn-ghost" type="button" data-admin-movie-action="reload">${icon('refresh-cw')} Tải lại</button>
        <button class="btn btn-primary" type="button" data-admin-movie-action="create">${icon('plus')} Thêm phim</button>
      </div>
    </div>

    <div class="admin-movie-filters">
      <label>
        <span>Tìm kiếm</span>
        <input type="search" name="q" value="${escapeHTML(state.filters.q)}" placeholder="Tên, slug, mô tả">
      </label>
      <label>
        <span>Hiển thị</span>
        ${renderSelect('isPublished', [
          ['', 'Tất cả'],
          ['true', 'Đang hiển thị'],
          ['false', 'Đang ẩn']
        ], state.filters.isPublished)}
      </label>
      <label>
        <span>Loại</span>
        ${renderSelect('type', MOVIE_TYPES, state.filters.type)}
      </label>
      <label>
        <span>Trạng thái</span>
        ${renderSelect('status', MOVIE_STATUS, state.filters.status)}
      </label>
      <label>
        <span>Sắp xếp</span>
        ${renderSelect('sort', SORT_OPTIONS, state.filters.sort)}
      </label>
      <label>
        <span>Mỗi trang</span>
        ${renderSelect('limit', [
          ['5', '5'],
          ['10', '10'],
          ['20', '20'],
          ['50', '50']
        ], String(state.limit))}
      </label>
      <button class="btn btn-primary" type="submit">${icon('filter')} Áp dụng</button>
    </div>
  </form>`;
}

function renderMovieTable() {
  if (state.isLoading) {
    return `<div class="admin-movie-state">${icon('loader')}<strong>Đang tải danh sách phim...</strong></div>`;
  }

  if (!state.items.length) {
    return `<div class="admin-movie-state">${icon('film')}<strong>Chưa có phim phù hợp</strong></div>`;
  }

  return `<div class="admin-movie-table-wrap">
    <table class="admin-movie-table">
      <thead>
        <tr>
          <th>Poster</th>
          <th>Tên phim</th>
          <th>Slug</th>
          <th>Loại</th>
          <th>Năm</th>
          <th>Quốc gia</th>
          <th>Thể loại</th>
          <th>Published</th>
          <th>Featured</th>
          <th>Lượt xem</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        ${state.items.map(renderMovieRow).join('')}
      </tbody>
    </table>
  </div>`;
}

function renderMovieRow(movie) {
  const image = firstImage(movie);
  const categories = categoryNames(movie);

  return `<tr>
    <td>
      ${image
        ? `<img class="admin-movie-poster" src="${escapeHTML(image)}" alt="Poster ${escapeHTML(movie.title)}" loading="lazy" decoding="async">`
        : `<div class="admin-movie-poster placeholder">${icon('image')}</div>`}
    </td>
    <td>
      <strong>${escapeHTML(movie.title)}</strong>
      <small>${escapeHTML(movie.originalTitle || 'Không có tên gốc')}</small>
    </td>
    <td><code>${escapeHTML(movie.slug)}</code></td>
    <td>${escapeHTML(formatType(movie.type))}</td>
    <td>${escapeHTML(movie.releaseYear || 'Chưa rõ')}</td>
    <td>${escapeHTML(movie.country?.name || movie.country?.code || 'Chưa gán')}</td>
    <td><span class="admin-movie-tags">${categories.length ? categories.map((name) => `<span>${escapeHTML(name)}</span>`).join('') : '<span>Chưa gán</span>'}</span></td>
    <td><span class="badge ${movie.isPublished ? 'gold' : ''}">${movie.isPublished ? 'Đang hiển thị' : 'Đang ẩn'}</span></td>
    <td><span class="badge ${movie.isFeatured ? 'red' : ''}">${movie.isFeatured ? 'Nổi bật' : 'Thường'}</span></td>
    <td>${formatNumber(movie.viewCount)}</td>
    <td>
      <div class="admin-movie-row-actions">
        <button class="round-btn" type="button" title="Xem chi tiết" aria-label="Xem chi tiết" data-admin-movie-action="detail" data-movie-id="${escapeHTML(movie.id)}">${icon('eye')}</button>
        <button class="round-btn" type="button" title="Sửa phim" aria-label="Sửa phim" data-admin-movie-action="edit" data-movie-id="${escapeHTML(movie.id)}">${icon('pencil')}</button>
        <button class="round-btn ${movie.isPublished ? 'active' : ''}" type="button" title="${movie.isPublished ? 'Tắt publish' : 'Bật publish'}" aria-label="${movie.isPublished ? 'Tắt publish' : 'Bật publish'}" data-admin-movie-action="toggle-publish" data-next-value="${movie.isPublished ? 'false' : 'true'}" data-movie-id="${escapeHTML(movie.id)}">${icon(movie.isPublished ? 'eye-off' : 'eye')}</button>
        <button class="round-btn ${movie.isFeatured ? 'active' : ''}" type="button" title="${movie.isFeatured ? 'Tắt nổi bật' : 'Bật nổi bật'}" aria-label="${movie.isFeatured ? 'Tắt nổi bật' : 'Bật nổi bật'}" data-admin-movie-action="toggle-featured" data-next-value="${movie.isFeatured ? 'false' : 'true'}" data-movie-id="${escapeHTML(movie.id)}">${icon('star')}</button>
        <button class="round-btn danger" type="button" title="Ẩn phim khỏi public" aria-label="Ẩn phim khỏi public" data-admin-movie-action="delete" data-movie-id="${escapeHTML(movie.id)}">${icon('trash-2')}</button>
      </div>
    </td>
  </tr>`;
}

function renderPagination() {
  const { page, total, totalPages } = state.pagination;

  return `<div class="admin-movie-pagination">
    <span>Trang ${page}/${totalPages} · ${formatNumber(total)} phim</span>
    <div>
      <button class="btn btn-ghost" type="button" data-admin-movie-action="prev-page" ${page <= 1 ? 'disabled' : ''}>${icon('chevron-left')} Trước</button>
      <button class="btn btn-ghost" type="button" data-admin-movie-action="next-page" ${page >= totalPages ? 'disabled' : ''}>Sau ${icon('chevron-right')}</button>
    </div>
  </div>`;
}

function renderCategoryReference() {
  if (!state.categories.length) {
    return '<p class="muted">Chưa tải được danh sách thể loại public. Có thể nhập id thủ công nếu biết.</p>';
  }

  return `<div class="admin-movie-category-ref">
    ${state.categories.map((category) => `<span><strong>${escapeHTML(category.name)}</strong><code>${escapeHTML(category.id)}</code></span>`).join('')}
  </div>`;
}

function renderCountryDatalist() {
  if (!state.countryOptions.length) return '';

  return `<datalist id="admin-country-options">
    ${state.countryOptions.map((country) => `<option value="${escapeHTML(country.id)}">${escapeHTML(country.label)}</option>`).join('')}
  </datalist>`;
}

function renderFormModal() {
  if (!state.formMode) return '';

  const isEdit = state.formMode === 'edit';
  const movie = state.formMovie || {};
  const title = isEdit ? 'Sửa phim' : 'Thêm phim';

  return `<div class="admin-movie-modal" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}">
    <div class="admin-movie-modal-panel wide">
      <div class="admin-movie-modal-head">
        <div>
          <p class="eyebrow">${isEdit ? 'Cập nhật phim' : 'Phim mới'}</p>
          <h2>${escapeHTML(title)}</h2>
        </div>
        <button class="round-btn" type="button" aria-label="Đóng" data-admin-movie-action="close-form">${icon('x')}</button>
      </div>

      ${state.formLoading ? `<div class="admin-movie-state">${icon('loader')}<strong>Đang tải dữ liệu phim...</strong></div>` : renderMovieForm(movie, isEdit)}
    </div>
  </div>`;
}

function renderMovieForm(movie, isEdit) {
  const selectedCategories = categoryIds(movie).join(', ');

  return `<form class="admin-movie-form" data-admin-movie-form>
    ${state.formError ? `<div class="admin-movie-alert error">${icon('circle-alert')}<span>${escapeHTML(state.formError)}</span></div>` : ''}
    <input type="hidden" name="id" value="${escapeHTML(movie.id || '')}">

    <div class="admin-movie-form-grid">
      <label>
        <span>Tiêu đề *</span>
        <input type="text" name="title" value="${escapeHTML(movie.title || '')}" placeholder="Tên phim" data-admin-movie-title required>
      </label>
      <label>
        <span>Slug *</span>
        <input type="text" name="slug" value="${escapeHTML(movie.slug || '')}" placeholder="slug-phim" data-admin-movie-slug data-auto-slug="${isEdit ? 'false' : 'true'}" required>
      </label>
      <label>
        <span>Tên gốc</span>
        <input type="text" name="originalTitle" value="${escapeHTML(movie.originalTitle || '')}" placeholder="Original title">
      </label>
      <label>
        <span>Năm phát hành</span>
        <input type="number" name="releaseYear" value="${escapeHTML(movie.releaseYear || '')}" min="1900" max="2100" placeholder="2026">
      </label>
      <label>
        <span>Thời lượng</span>
        <input type="number" name="duration" value="${escapeHTML(movie.durationMinutes || '')}" min="1" placeholder="90">
      </label>
      <label>
        <span>Loại</span>
        ${renderSelect('type', [
          ['MOVIE', 'Phim lẻ'],
          ['SERIES', 'Phim bộ']
        ], movie.type || 'MOVIE')}
      </label>
      <label>
        <span>Trạng thái</span>
        ${renderSelect('status', [
          ['DRAFT', 'Nháp'],
          ['PUBLISHED', 'Đã publish'],
          ['HIDDEN', 'Đã ẩn']
        ], movie.status || 'DRAFT')}
      </label>
      <label>
        <span>Chất lượng</span>
        <input type="text" name="quality" value="${escapeHTML(movie.quality || '')}" placeholder="HD, Full HD, 4K">
      </label>
      <label>
        <span>Ngôn ngữ</span>
        <input type="text" name="language" value="${escapeHTML(movie.language || '')}" placeholder="Tiếng Việt">
      </label>
      <label>
        <span>Country ID</span>
        <input type="text" name="countryId" value="${escapeHTML(movie.country?.id || '')}" list="admin-country-options" placeholder="Nhập countryId thủ công">
      </label>
      <label class="admin-movie-form-wide">
        <span>Poster URL</span>
        <input type="text" name="posterUrl" value="${escapeHTML(movie.posterUrl || '')}" placeholder="https://...">
      </label>
      <label class="admin-movie-form-wide">
        <span>Backdrop URL</span>
        <input type="text" name="backdropUrl" value="${escapeHTML(movie.backdropUrl || '')}" placeholder="https://...">
      </label>
      <label class="admin-movie-form-wide">
        <span>Trailer URL</span>
        <input type="text" name="trailerUrl" value="${escapeHTML(movie.trailerUrl || '')}" placeholder="https://...">
      </label>
      <label class="admin-movie-form-wide">
        <span>Category IDs</span>
        <input type="text" name="categoryIds" value="${escapeHTML(selectedCategories)}" placeholder="id-1, id-2">
      </label>
      <label class="admin-movie-form-wide">
        <span>Mô tả</span>
        <textarea name="description" rows="4" placeholder="Mô tả phim">${escapeHTML(movie.description || '')}</textarea>
      </label>
    </div>

    <div class="admin-movie-switches">
      <label><input type="checkbox" name="isPublished" ${movie.isPublished ? 'checked' : ''}> Published</label>
      <label><input type="checkbox" name="isFeatured" ${movie.isFeatured ? 'checked' : ''}> Featured</label>
    </div>

    <div class="admin-movie-help">
      <strong>Thể loại hiện có</strong>
      ${renderCategoryReference()}
      <p class="muted">Country ID hiện nhập thủ công từ dữ liệu list/detail. Upload file thật chưa có, form chỉ nhận URL poster/backdrop/trailer.</p>
    </div>

    ${renderCountryDatalist()}

    <div class="admin-movie-form-actions">
      <button class="btn btn-ghost" type="button" data-admin-movie-action="close-form">Hủy</button>
      <button class="btn btn-primary" type="submit" ${state.isSubmitting ? 'disabled' : ''}>${icon('save')} ${state.isSubmitting ? 'Đang lưu...' : 'Lưu phim'}</button>
    </div>
  </form>`;
}

function renderDetailModal() {
  if (!state.detailLoading && !state.detailMovie && !state.detailError) return '';

  return `<div class="admin-movie-modal" role="dialog" aria-modal="true" aria-label="Chi tiết phim admin">
    <div class="admin-movie-modal-panel">
      <div class="admin-movie-modal-head">
        <div>
          <p class="eyebrow">Chi tiết admin</p>
          <h2>${escapeHTML(state.detailMovie?.title || 'Đang tải phim')}</h2>
        </div>
        <button class="round-btn" type="button" aria-label="Đóng" data-admin-movie-action="close-detail">${icon('x')}</button>
      </div>
      ${state.detailLoading ? `<div class="admin-movie-state">${icon('loader')}<strong>Đang tải chi tiết phim...</strong></div>` : renderMovieDetail()}
    </div>
  </div>`;
}

function renderMovieDetail() {
  if (state.detailError) {
    return `<div class="admin-movie-alert error">${icon('circle-alert')}<span>${escapeHTML(state.detailError)}</span></div>`;
  }

  const movie = state.detailMovie;
  const episodes = movie.episodes || [];

  return `<div class="admin-movie-detail">
    <div class="admin-movie-detail-media">
      ${movie.posterUrl ? `<img src="${escapeHTML(movie.posterUrl)}" alt="Poster ${escapeHTML(movie.title)}">` : `<div>${icon('image')} Chưa có poster</div>`}
      <p><strong>Backdrop:</strong> ${movie.backdropUrl ? `<a href="${escapeHTML(movie.backdropUrl)}" target="_blank" rel="noreferrer">Mở URL</a>` : 'Chưa có'}</p>
      <p><strong>Trailer:</strong> ${movie.trailerUrl ? `<a href="${escapeHTML(movie.trailerUrl)}" target="_blank" rel="noreferrer">Mở URL</a>` : 'Chưa có'}</p>
    </div>
    <div class="admin-movie-detail-body">
      <div class="badges">
        <span class="badge">${escapeHTML(formatType(movie.type))}</span>
        <span class="badge ${movie.status === 'PUBLISHED' ? 'gold' : ''}">${escapeHTML(formatStatus(movie.status))}</span>
        <span class="badge ${movie.isPublished ? 'gold' : ''}">${movie.isPublished ? 'Public' : 'Ẩn public'}</span>
        <span class="badge ${movie.isFeatured ? 'red' : ''}">${movie.isFeatured ? 'Nổi bật' : 'Không nổi bật'}</span>
      </div>
      <p><strong>Slug:</strong> <code>${escapeHTML(movie.slug)}</code></p>
      <p><strong>Tên gốc:</strong> ${escapeHTML(movie.originalTitle || 'Chưa có')}</p>
      <p><strong>Năm:</strong> ${escapeHTML(movie.releaseYear || 'Chưa rõ')} · <strong>Thời lượng:</strong> ${escapeHTML(movie.durationMinutes || 'Chưa rõ')} phút</p>
      <p><strong>Quốc gia:</strong> ${escapeHTML(movie.country?.name || movie.country?.id || 'Chưa gán')}</p>
      <p><strong>Thể loại:</strong> ${categoryNames(movie).map(escapeHTML).join(', ') || 'Chưa gán'}</p>
      <p><strong>Lượt xem:</strong> ${formatNumber(movie.viewCount)}</p>
      <p>${escapeHTML(movie.description || 'Chưa có mô tả')}</p>
      <div class="admin-movie-episodes">
        <strong>Tập phim API trả về (${episodes.length})</strong>
        ${episodes.length
          ? episodes.map((episode) => `<span>${escapeHTML(episode.episodeNumber || '')}. ${escapeHTML(episode.title || episode.slug || episode.id)} · ${episode.isPublished ? 'Published' : 'Ẩn'}</span>`).join('')
          : '<span>Chưa có tập phim trong response.</span>'}
      </div>
    </div>
  </div>`;
}

function render() {
  if (!state.root) return;

  state.root.innerHTML = `<section class="admin-movie-panel">
    ${renderFeedback()}
    ${renderToolbar()}
    ${renderMovieTable()}
    ${renderPagination()}
    <section class="admin-note">
      ${icon('info')}
      <p>Xóa phim ở đây là ẩn khỏi public bằng soft delete, không hard delete. CRUD tập phim, thể loại, user và bình luận/báo lỗi chưa được làm trong bước này.</p>
    </section>
    ${renderFormModal()}
    ${renderDetailModal()}
  </section>`;

  bindEvents();
  createIcons();
}

async function loadCategories() {
  try {
    const data = await fetchCategories();
    state.categories = data.items || [];
  } catch {
    state.categories = [];
  }
}

async function loadMovies(options = {}) {
  if (options.page) state.page = options.page;
  state.isLoading = true;
  state.error = '';
  render();

  try {
    const data = await getAdminMovies({
      page: state.page,
      limit: state.limit,
      ...state.filters
    });
    state.items = data.items || [];
    state.pagination = normalizePagination(data.pagination);
    state.page = state.pagination.page;
    collectCountryOptions(state.items);
  } catch (error) {
    state.items = [];
    state.pagination = normalizePagination({ page: state.page, limit: state.limit, total: 0, totalPages: 1 });
    state.error = adminErrorMessage(error);
  } finally {
    state.isLoading = false;
    render();
  }
}

function openCreateForm() {
  state.formMode = 'create';
  state.formMovie = {
    type: 'MOVIE',
    status: 'DRAFT',
    isPublished: false,
    isFeatured: false
  };
  state.formLoading = false;
  state.formError = '';
  state.success = '';
  render();
}

async function openEditForm(id) {
  state.formMode = 'edit';
  state.formMovie = null;
  state.formLoading = true;
  state.formError = '';
  state.success = '';
  render();

  try {
    const data = await getAdminMovieById(id);
    state.formMovie = data.movie;
    collectCountryOptions([data.movie]);
  } catch (error) {
    state.formError = adminErrorMessage(error);
  } finally {
    state.formLoading = false;
    render();
  }
}

async function openDetail(id) {
  state.detailLoading = true;
  state.detailMovie = null;
  state.detailError = '';
  state.success = '';
  render();

  try {
    const data = await getAdminMovieById(id);
    state.detailMovie = data.movie;
    collectCountryOptions([data.movie]);
  } catch (error) {
    state.detailError = adminErrorMessage(error);
  } finally {
    state.detailLoading = false;
    render();
  }
}

function closeForm() {
  state.formMode = '';
  state.formMovie = null;
  state.formLoading = false;
  state.formError = '';
  render();
}

function closeDetail() {
  state.detailMovie = null;
  state.detailLoading = false;
  state.detailError = '';
  render();
}

function formPayload(form) {
  const formData = new FormData(form);
  const title = String(formData.get('title') || '').trim();
  const slug = String(formData.get('slug') || '').trim();
  const releaseYearText = String(formData.get('releaseYear') || '').trim();
  const durationText = String(formData.get('duration') || '').trim();
  const categoryIdsText = String(formData.get('categoryIds') || '').trim();
  const errors = [];

  if (!title) errors.push('Tiêu đề là bắt buộc.');
  if (!slug) errors.push('Slug là bắt buộc.');

  const releaseYear = releaseYearText ? Number(releaseYearText) : undefined;
  const duration = durationText ? Number(durationText) : undefined;

  if (releaseYearText && (!Number.isInteger(releaseYear) || releaseYear < 1900 || releaseYear > 2100)) {
    errors.push('Năm phát hành phải là số nguyên trong khoảng 1900-2100.');
  }

  if (durationText && (!Number.isInteger(duration) || duration < 1)) {
    errors.push('Thời lượng phải là số nguyên lớn hơn 0.');
  }

  if (errors.length) {
    return { errors };
  }

  const payload = {
    title,
    slug,
    type: String(formData.get('type') || 'MOVIE'),
    status: String(formData.get('status') || 'DRAFT'),
    isPublished: formData.has('isPublished'),
    isFeatured: formData.has('isFeatured'),
    categoryIds: categoryIdsText
      ? [...new Set(categoryIdsText.split(',').map((id) => id.trim()).filter(Boolean))]
      : []
  };

  [
    'originalTitle',
    'description',
    'posterUrl',
    'backdropUrl',
    'trailerUrl',
    'quality',
    'language',
    'countryId'
  ].forEach((field) => {
    const value = String(formData.get(field) || '').trim();
    if (value) payload[field] = value;
  });

  if (releaseYear !== undefined) payload.releaseYear = releaseYear;
  if (duration !== undefined) payload.duration = duration;

  return { payload };
}

async function submitMovieForm(form) {
  const { payload, errors } = formPayload(form);

  if (errors) {
    state.formError = errors.join(' ');
    render();
    return;
  }

  const id = String(new FormData(form).get('id') || '').trim();
  const isEdit = state.formMode === 'edit';
  state.isSubmitting = true;
  state.formError = '';
  render();

  try {
    if (isEdit) {
      await updateAdminMovie(id, payload);
      state.success = 'Đã cập nhật phim thành công.';
    } else {
      await createAdminMovie(payload);
      state.success = 'Đã tạo phim thành công.';
      state.page = 1;
    }

    state.formMode = '';
    state.formMovie = null;
    await loadMovies();
  } catch (error) {
    state.formError = adminErrorMessage(error);
  } finally {
    state.isSubmitting = false;
    render();
  }
}

async function togglePublish(id, nextValue) {
  const isPublished = nextValue === 'true';
  if (!isPublished && !window.confirm('Bạn có chắc muốn tắt hiển thị public của phim này không?')) return;

  state.isSubmitting = true;
  state.error = '';
  state.success = '';
  render();

  try {
    await updateAdminMoviePublish(id, isPublished);
    state.success = isPublished ? 'Đã bật publish cho phim.' : 'Đã tắt publish và ẩn phim khỏi public.';
    await loadMovies();
  } catch (error) {
    state.error = adminErrorMessage(error);
  } finally {
    state.isSubmitting = false;
    render();
  }
}

async function toggleFeatured(id, nextValue) {
  const isFeatured = nextValue === 'true';
  state.isSubmitting = true;
  state.error = '';
  state.success = '';
  render();

  try {
    await updateAdminMovieFeatured(id, isFeatured);
    state.success = isFeatured ? 'Đã bật nổi bật cho phim.' : 'Đã tắt nổi bật cho phim.';
    await loadMovies();
  } catch (error) {
    state.error = adminErrorMessage(error);
  } finally {
    state.isSubmitting = false;
    render();
  }
}

async function deleteMovie(id) {
  if (!window.confirm('Bạn có chắc muốn ẩn phim này khỏi public không?')) return;

  state.isSubmitting = true;
  state.error = '';
  state.success = '';
  render();

  try {
    await softDeleteAdminMovie(id);
    state.success = 'Đã ẩn phim khỏi public. Đây là soft delete, không hard delete.';
    await loadMovies();
  } catch (error) {
    state.error = adminErrorMessage(error);
  } finally {
    state.isSubmitting = false;
    render();
  }
}

function bindEvents() {
  state.root.onclick = async (event) => {
    const button = event.target.closest('[data-admin-movie-action]');
    if (!button) return;

    const action = button.dataset.adminMovieAction;
    const id = button.dataset.movieId;
    event.preventDefault();

    if (button.disabled) return;
    if (action === 'reload') await loadMovies();
    if (action === 'create') openCreateForm();
    if (action === 'edit') await openEditForm(id);
    if (action === 'detail') await openDetail(id);
    if (action === 'close-form') closeForm();
    if (action === 'close-detail') closeDetail();
    if (action === 'prev-page') await loadMovies({ page: Math.max(state.page - 1, 1) });
    if (action === 'next-page') await loadMovies({ page: Math.min(state.page + 1, state.pagination.totalPages) });
    if (action === 'toggle-publish') await togglePublish(id, button.dataset.nextValue);
    if (action === 'toggle-featured') await toggleFeatured(id, button.dataset.nextValue);
    if (action === 'delete') await deleteMovie(id);
  };

  state.root.onsubmit = async (event) => {
    if (event.target.matches('[data-admin-movie-filter]')) {
      event.preventDefault();
      const formData = new FormData(event.target);
      state.filters = {
        q: String(formData.get('q') || '').trim(),
        isPublished: String(formData.get('isPublished') || ''),
        type: String(formData.get('type') || ''),
        status: String(formData.get('status') || ''),
        sort: String(formData.get('sort') || 'newest')
      };
      state.limit = Number(formData.get('limit')) || 10;
      state.page = 1;
      state.success = '';
      await loadMovies();
    }

    if (event.target.matches('[data-admin-movie-form]')) {
      event.preventDefault();
      await submitMovieForm(event.target);
    }
  };

  state.root.oninput = (event) => {
    const titleInput = event.target.closest('[data-admin-movie-title]');
    const slugInput = event.target.closest('[data-admin-movie-slug]');

    if (slugInput) {
      slugInput.dataset.autoSlug = 'false';
    }

    if (!titleInput) return;

    const form = titleInput.closest('[data-admin-movie-form]');
    const slug = form?.querySelector('[data-admin-movie-slug]');
    if (!slug || slug.dataset.autoSlug === 'false') return;
    slug.value = slugify(titleInput.value);
  };
}

export async function renderAdminMovieManager(root) {
  state.root = root;

  if (!state.didInit) {
    state.didInit = true;
    render();
    await Promise.all([loadCategories(), loadMovies()]);
    render();
    return;
  }

  render();
}
