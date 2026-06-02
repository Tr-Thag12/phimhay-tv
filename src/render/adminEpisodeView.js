import {
  createAdminEpisode,
  getAdminEpisodeById,
  getAdminEpisodes,
  softDeleteAdminEpisode,
  updateAdminEpisode,
  updateAdminEpisodePublish
} from '../services/adminEpisodeApi.js';
import { getAdminMovies } from '../services/adminMovieApi.js';
import { ApiError } from '../services/apiClient.js';
import { createIcons } from '../utils/dom.js';
import { escapeHTML } from '../utils/format.js';
import { slugify } from '../utils/slug.js';
import { icon } from './layout.js';

const ADMIN_BACKEND_OFFLINE_MESSAGE =
  'Không kết nối được backend admin. Hãy chạy backend local.';

const EPISODE_STATUS = [
  ['', 'Tất cả trạng thái'],
  ['DRAFT', 'Nháp'],
  ['PUBLISHED', 'Đã publish'],
  ['HIDDEN', 'Đã ẩn']
];

const SORT_OPTIONS = [
  ['newest', 'Mới nhất'],
  ['oldest', 'Cũ nhất'],
  ['episodeNumber', 'Số tập']
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
    movieId: '',
    isPublished: '',
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
  movies: [],
  formMode: '',
  formEpisode: null,
  formLoading: false,
  formError: '',
  detailEpisode: null,
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

function formatNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number.toLocaleString('vi-VN') : '0';
}

function formatStatus(status) {
  if (status === 'PUBLISHED') return 'Đã publish';
  if (status === 'HIDDEN') return 'Đã ẩn';
  if (status === 'DRAFT') return 'Nháp';
  return status || 'Chưa rõ';
}

function renderSelect(name, options, selectedValue, extra = '') {
  return `<select name="${escapeHTML(name)}" ${extra}>
    ${options.map(([value, label]) => `<option value="${escapeHTML(value)}" ${String(selectedValue) === String(value) ? 'selected' : ''}>${escapeHTML(label)}</option>`).join('')}
  </select>`;
}

function movieLabel(movie) {
  if (!movie) return 'Chưa gắn phim';
  return [movie.title, movie.slug].filter(Boolean).join(' - ');
}

function movieOptions(includeAll = false) {
  const options = includeAll ? [['', 'Tất cả phim']] : [['', 'Chọn phim']];
  return [
    ...options,
    ...state.movies.map((movie) => [movie.id, movieLabel(movie)])
  ];
}

function renderFeedback() {
  return `
    ${state.error ? `<div class="admin-movie-alert error">${icon('circle-alert')}<span>${escapeHTML(state.error)}</span></div>` : ''}
    ${state.success ? `<div class="admin-movie-alert success">${icon('circle-check')}<span>${escapeHTML(state.success)}</span></div>` : ''}
  `;
}

function renderToolbar() {
  return `<form class="admin-movie-toolbar" data-admin-episode-filter>
    <div class="admin-movie-toolbar-head">
      <div>
        <p class="eyebrow">Quản lý tập phim</p>
        <h2>Danh sách tập phim admin</h2>
      </div>
      <div class="admin-movie-actions">
        <button class="btn btn-ghost" type="button" data-admin-episode-action="reload">${icon('refresh-cw')} Tải lại</button>
        <button class="btn btn-primary" type="button" data-admin-episode-action="create">${icon('plus')} Thêm tập</button>
      </div>
    </div>

    <div class="admin-movie-filters">
      <label>
        <span>Tìm kiếm</span>
        <input type="search" name="q" value="${escapeHTML(state.filters.q)}" placeholder="Tên tập, slug, phim">
      </label>
      <label>
        <span>Phim</span>
        ${renderSelect('movieId', movieOptions(true), state.filters.movieId)}
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
        <span>Trạng thái</span>
        ${renderSelect('status', EPISODE_STATUS, state.filters.status)}
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

function renderEpisodeTable() {
  if (state.isLoading) {
    return `<div class="admin-movie-state">${icon('loader')}<strong>Đang tải danh sách tập phim...</strong></div>`;
  }

  if (!state.items.length) {
    return `<div class="admin-movie-state">${icon('list-video')}<strong>Chưa có tập phim phù hợp</strong></div>`;
  }

  return `<div class="admin-movie-table-wrap">
    <table class="admin-movie-table">
      <thead>
        <tr>
          <th>Phim</th>
          <th>Số tập</th>
          <th>Tiêu đề tập</th>
          <th>Slug</th>
          <th>Duration</th>
          <th>Published</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        ${state.items.map(renderEpisodeRow).join('')}
      </tbody>
    </table>
  </div>`;
}

function renderEpisodeRow(episode) {
  return `<tr>
    <td>
      <strong>${escapeHTML(episode.movie?.title || 'Chưa rõ phim')}</strong>
      <small>${escapeHTML(episode.movie?.slug || episode.movieId)}</small>
    </td>
    <td>${escapeHTML(episode.episodeNumber || 'Chưa rõ')}</td>
    <td>
      <strong>${escapeHTML(episode.title)}</strong>
      <small>${escapeHTML(formatStatus(episode.status))}</small>
    </td>
    <td><code>${escapeHTML(episode.slug)}</code></td>
    <td>${episode.durationMinutes ? `${formatNumber(episode.durationMinutes)} phút` : 'Chưa rõ'}</td>
    <td><span class="badge ${episode.isPublished ? 'gold' : ''}">${episode.isPublished ? 'Đang hiển thị' : 'Đang ẩn'}</span></td>
    <td>
      <div class="admin-movie-row-actions">
        <button class="round-btn" type="button" title="Xem chi tiết" aria-label="Xem chi tiết" data-admin-episode-action="detail" data-episode-id="${escapeHTML(episode.id)}">${icon('eye')}</button>
        <button class="round-btn" type="button" title="Sửa tập" aria-label="Sửa tập" data-admin-episode-action="edit" data-episode-id="${escapeHTML(episode.id)}">${icon('pencil')}</button>
        <button class="round-btn ${episode.isPublished ? 'active' : ''}" type="button" title="${episode.isPublished ? 'Tắt publish' : 'Bật publish'}" aria-label="${episode.isPublished ? 'Tắt publish' : 'Bật publish'}" data-admin-episode-action="toggle-publish" data-next-value="${episode.isPublished ? 'false' : 'true'}" data-episode-id="${escapeHTML(episode.id)}">${icon(episode.isPublished ? 'eye-off' : 'eye')}</button>
        <button class="round-btn danger" type="button" title="Ẩn tập phim" aria-label="Ẩn tập phim" data-admin-episode-action="delete" data-episode-id="${escapeHTML(episode.id)}">${icon('trash-2')}</button>
      </div>
    </td>
  </tr>`;
}

function renderPagination() {
  const { page, total, totalPages } = state.pagination;

  return `<div class="admin-movie-pagination">
    <span>Trang ${page}/${totalPages} · ${formatNumber(total)} tập phim</span>
    <div>
      <button class="btn btn-ghost" type="button" data-admin-episode-action="prev-page" ${page <= 1 ? 'disabled' : ''}>${icon('chevron-left')} Trước</button>
      <button class="btn btn-ghost" type="button" data-admin-episode-action="next-page" ${page >= totalPages ? 'disabled' : ''}>Sau ${icon('chevron-right')}</button>
    </div>
  </div>`;
}

function renderFormModal() {
  if (!state.formMode) return '';

  const isEdit = state.formMode === 'edit';
  const episode = state.formEpisode || {};
  const title = isEdit ? 'Sửa tập phim' : 'Thêm tập phim';

  return `<div class="admin-movie-modal" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}">
    <div class="admin-movie-modal-panel wide">
      <div class="admin-movie-modal-head">
        <div>
          <p class="eyebrow">${isEdit ? 'Cập nhật tập phim' : 'Tập phim mới'}</p>
          <h2>${escapeHTML(title)}</h2>
        </div>
        <button class="round-btn" type="button" aria-label="Đóng" data-admin-episode-action="close-form">${icon('x')}</button>
      </div>

      ${state.formLoading ? `<div class="admin-movie-state">${icon('loader')}<strong>Đang tải dữ liệu tập phim...</strong></div>` : renderEpisodeForm(episode, isEdit)}
    </div>
  </div>`;
}

function renderEpisodeForm(episode, isEdit) {
  return `<form class="admin-movie-form" data-admin-episode-form>
    ${state.formError ? `<div class="admin-movie-alert error">${icon('circle-alert')}<span>${escapeHTML(state.formError)}</span></div>` : ''}
    <input type="hidden" name="id" value="${escapeHTML(episode.id || '')}">

    <div class="admin-movie-form-grid">
      <label>
        <span>Phim *</span>
        ${renderSelect('movieId', movieOptions(false), episode.movieId || state.filters.movieId, 'required')}
      </label>
      <label>
        <span>Số tập *</span>
        <input type="number" name="episodeNumber" value="${escapeHTML(episode.episodeNumber || '')}" min="1" placeholder="1" required>
      </label>
      <label>
        <span>Tiêu đề tập *</span>
        <input type="text" name="title" value="${escapeHTML(episode.title || '')}" placeholder="Tập 1" data-admin-episode-title required>
      </label>
      <label>
        <span>Slug *</span>
        <input type="text" name="slug" value="${escapeHTML(episode.slug || '')}" placeholder="tap-1" data-admin-episode-slug data-auto-slug="${isEdit ? 'false' : 'true'}" required>
      </label>
      <label>
        <span>Thời lượng</span>
        <input type="number" name="duration" value="${escapeHTML(episode.durationMinutes || '')}" min="1" placeholder="45">
      </label>
      <label>
        <span>Trạng thái</span>
        ${renderSelect('status', [
          ['DRAFT', 'Nháp'],
          ['PUBLISHED', 'Đã publish'],
          ['HIDDEN', 'Đã ẩn']
        ], episode.status || 'DRAFT')}
      </label>
      <label class="admin-movie-form-wide">
        <span>Thumbnail URL</span>
        <input type="text" name="thumbnailUrl" value="${escapeHTML(episode.thumbnailUrl || '')}" placeholder="https://...">
      </label>
      <label class="admin-movie-form-wide">
        <span>Video URL</span>
        <input type="text" name="videoUrl" value="${escapeHTML(episode.videoUrl || '')}" placeholder="https://...">
      </label>
    </div>

    <div class="admin-movie-switches">
      <label><input type="checkbox" name="isPublished" ${episode.isPublished ? 'checked' : ''}> Published</label>
    </div>

    <div class="admin-movie-help">
      <strong>Phạm vi tập phim</strong>
      <p class="muted">Schema hiện có videoUrl và thumbnailUrl, chưa có description hoặc embedUrl. Upload file thật chưa có, form chỉ nhận URL.</p>
    </div>

    <div class="admin-movie-form-actions">
      <button class="btn btn-ghost" type="button" data-admin-episode-action="close-form">Hủy</button>
      <button class="btn btn-primary" type="submit" ${state.isSubmitting ? 'disabled' : ''}>${icon('save')} ${state.isSubmitting ? 'Đang lưu...' : 'Lưu tập phim'}</button>
    </div>
  </form>`;
}

function renderDetailModal() {
  if (!state.detailLoading && !state.detailEpisode && !state.detailError) return '';

  return `<div class="admin-movie-modal" role="dialog" aria-modal="true" aria-label="Chi tiết tập phim admin">
    <div class="admin-movie-modal-panel">
      <div class="admin-movie-modal-head">
        <div>
          <p class="eyebrow">Chi tiết tập phim</p>
          <h2>${escapeHTML(state.detailEpisode?.title || 'Đang tải tập phim')}</h2>
        </div>
        <button class="round-btn" type="button" aria-label="Đóng" data-admin-episode-action="close-detail">${icon('x')}</button>
      </div>
      ${state.detailLoading ? `<div class="admin-movie-state">${icon('loader')}<strong>Đang tải chi tiết tập phim...</strong></div>` : renderEpisodeDetail()}
    </div>
  </div>`;
}

function renderEpisodeDetail() {
  if (state.detailError) {
    return `<div class="admin-movie-alert error">${icon('circle-alert')}<span>${escapeHTML(state.detailError)}</span></div>`;
  }

  const episode = state.detailEpisode;

  return `<div class="admin-movie-detail">
    <div class="admin-movie-detail-media">
      ${episode.thumbnailUrl ? `<img src="${escapeHTML(episode.thumbnailUrl)}" alt="Thumbnail ${escapeHTML(episode.title)}">` : `<div>${icon('image')} Chưa có thumbnail</div>`}
      <p><strong>Video URL:</strong> ${episode.videoUrl ? `<a href="${escapeHTML(episode.videoUrl)}" target="_blank" rel="noreferrer">Mở URL</a>` : 'Chưa có'}</p>
    </div>
    <div class="admin-movie-detail-body">
      <div class="badges">
        <span class="badge">${escapeHTML(formatStatus(episode.status))}</span>
        <span class="badge ${episode.isPublished ? 'gold' : ''}">${episode.isPublished ? 'Public' : 'Ẩn public'}</span>
      </div>
      <p><strong>Phim:</strong> ${escapeHTML(movieLabel(episode.movie))}</p>
      <p><strong>Số tập:</strong> ${escapeHTML(episode.episodeNumber || 'Chưa rõ')}</p>
      <p><strong>Slug:</strong> <code>${escapeHTML(episode.slug)}</code></p>
      <p><strong>Thời lượng:</strong> ${episode.durationMinutes ? `${formatNumber(episode.durationMinutes)} phút` : 'Chưa rõ'}</p>
      <p><strong>Episode ID:</strong> <code>${escapeHTML(episode.id)}</code></p>
      <p><strong>Movie ID:</strong> <code>${escapeHTML(episode.movieId)}</code></p>
    </div>
  </div>`;
}

function render() {
  if (!state.root) return;

  state.root.innerHTML = `<section class="admin-movie-panel">
    ${renderFeedback()}
    ${renderToolbar()}
    ${renderEpisodeTable()}
    ${renderPagination()}
    <section class="admin-note">
      ${icon('info')}
      <p>Xóa tập phim ở đây là ẩn khỏi public bằng soft delete: isPublished=false, status=HIDDEN. Schema hiện chưa có description/embedUrl nên UI chưa nhập hai field này.</p>
    </section>
    ${renderFormModal()}
    ${renderDetailModal()}
  </section>`;

  bindEvents();
  createIcons();
}

async function loadMovies() {
  try {
    const data = await getAdminMovies({
      limit: 100,
      sort: 'title'
    });
    state.movies = data.items || [];
  } catch {
    state.movies = [];
  }
}

async function loadEpisodes(options = {}) {
  if (options.page) state.page = options.page;
  state.isLoading = true;
  state.error = '';
  render();

  try {
    const data = await getAdminEpisodes({
      page: state.page,
      limit: state.limit,
      ...state.filters
    });
    state.items = data.items || [];
    state.pagination = normalizePagination(data.pagination);
    state.page = state.pagination.page;
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
  state.formEpisode = {
    movieId: state.filters.movieId || state.movies[0]?.id || '',
    status: 'DRAFT',
    isPublished: false
  };
  state.formLoading = false;
  state.formError = '';
  state.success = '';
  render();
}

async function openEditForm(id) {
  state.formMode = 'edit';
  state.formEpisode = null;
  state.formLoading = true;
  state.formError = '';
  state.success = '';
  render();

  try {
    const data = await getAdminEpisodeById(id);
    state.formEpisode = data.episode;
  } catch (error) {
    state.formError = adminErrorMessage(error);
  } finally {
    state.formLoading = false;
    render();
  }
}

async function openDetail(id) {
  state.detailLoading = true;
  state.detailEpisode = null;
  state.detailError = '';
  state.success = '';
  render();

  try {
    const data = await getAdminEpisodeById(id);
    state.detailEpisode = data.episode;
  } catch (error) {
    state.detailError = adminErrorMessage(error);
  } finally {
    state.detailLoading = false;
    render();
  }
}

function closeForm() {
  state.formMode = '';
  state.formEpisode = null;
  state.formLoading = false;
  state.formError = '';
  render();
}

function closeDetail() {
  state.detailEpisode = null;
  state.detailLoading = false;
  state.detailError = '';
  render();
}

function formPayload(form) {
  const formData = new FormData(form);
  const movieId = String(formData.get('movieId') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const slug = String(formData.get('slug') || '').trim();
  const episodeNumberText = String(formData.get('episodeNumber') || '').trim();
  const durationText = String(formData.get('duration') || '').trim();
  const errors = [];

  if (!movieId) errors.push('Phim là bắt buộc.');
  if (!title) errors.push('Tiêu đề tập là bắt buộc.');
  if (!slug) errors.push('Slug là bắt buộc.');

  const episodeNumber = episodeNumberText ? Number(episodeNumberText) : undefined;
  const duration = durationText ? Number(durationText) : undefined;

  if (!Number.isInteger(episodeNumber) || episodeNumber < 1) {
    errors.push('Số tập phải là số nguyên lớn hơn 0.');
  }

  if (durationText && (!Number.isInteger(duration) || duration < 1)) {
    errors.push('Thời lượng phải là số nguyên lớn hơn 0.');
  }

  if (errors.length) {
    return { errors };
  }

  const payload = {
    movieId,
    title,
    slug,
    episodeNumber,
    status: String(formData.get('status') || 'DRAFT'),
    isPublished: formData.has('isPublished')
  };

  ['thumbnailUrl', 'videoUrl'].forEach((field) => {
    const value = String(formData.get(field) || '').trim();
    if (value) payload[field] = value;
  });

  if (duration !== undefined) payload.duration = duration;

  return { payload };
}

async function submitEpisodeForm(form) {
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
      await updateAdminEpisode(id, payload);
      state.success = 'Đã cập nhật tập phim thành công.';
    } else {
      await createAdminEpisode(payload);
      state.success = 'Đã tạo tập phim thành công.';
      state.page = 1;
    }

    state.formMode = '';
    state.formEpisode = null;
    await loadEpisodes();
  } catch (error) {
    state.formError = adminErrorMessage(error);
  } finally {
    state.isSubmitting = false;
    render();
  }
}

async function togglePublish(id, nextValue) {
  const isPublished = nextValue === 'true';
  if (!isPublished && !window.confirm('Bạn có chắc muốn tắt hiển thị public của tập này không?')) return;

  state.isSubmitting = true;
  state.error = '';
  state.success = '';
  render();

  try {
    await updateAdminEpisodePublish(id, isPublished);
    state.success = isPublished ? 'Đã bật publish cho tập phim.' : 'Đã tắt publish và ẩn tập phim khỏi public.';
    await loadEpisodes();
  } catch (error) {
    state.error = adminErrorMessage(error);
  } finally {
    state.isSubmitting = false;
    render();
  }
}

async function deleteEpisode(id) {
  if (!window.confirm('Bạn có chắc muốn ẩn tập phim này khỏi public không?')) return;

  state.isSubmitting = true;
  state.error = '';
  state.success = '';
  render();

  try {
    await softDeleteAdminEpisode(id);
    state.success = 'Đã ẩn tập phim khỏi public. Đây là soft delete, không hard delete.';
    await loadEpisodes();
  } catch (error) {
    state.error = adminErrorMessage(error);
  } finally {
    state.isSubmitting = false;
    render();
  }
}

function bindEvents() {
  state.root.onclick = async (event) => {
    const button = event.target.closest('[data-admin-episode-action]');
    if (!button) return;

    const action = button.dataset.adminEpisodeAction;
    const id = button.dataset.episodeId;
    event.preventDefault();

    if (button.disabled) return;
    if (action === 'reload') {
      await Promise.all([loadMovies(), loadEpisodes()]);
    }
    if (action === 'create') openCreateForm();
    if (action === 'edit') await openEditForm(id);
    if (action === 'detail') await openDetail(id);
    if (action === 'close-form') closeForm();
    if (action === 'close-detail') closeDetail();
    if (action === 'prev-page') await loadEpisodes({ page: Math.max(state.page - 1, 1) });
    if (action === 'next-page') await loadEpisodes({ page: Math.min(state.page + 1, state.pagination.totalPages) });
    if (action === 'toggle-publish') await togglePublish(id, button.dataset.nextValue);
    if (action === 'delete') await deleteEpisode(id);
  };

  state.root.onsubmit = async (event) => {
    if (event.target.matches('[data-admin-episode-filter]')) {
      event.preventDefault();
      const formData = new FormData(event.target);
      state.filters = {
        q: String(formData.get('q') || '').trim(),
        movieId: String(formData.get('movieId') || ''),
        isPublished: String(formData.get('isPublished') || ''),
        status: String(formData.get('status') || ''),
        sort: String(formData.get('sort') || 'newest')
      };
      state.limit = Number(formData.get('limit')) || 10;
      state.page = 1;
      state.success = '';
      await loadEpisodes();
    }

    if (event.target.matches('[data-admin-episode-form]')) {
      event.preventDefault();
      await submitEpisodeForm(event.target);
    }
  };

  state.root.oninput = (event) => {
    const titleInput = event.target.closest('[data-admin-episode-title]');
    const slugInput = event.target.closest('[data-admin-episode-slug]');

    if (slugInput) {
      slugInput.dataset.autoSlug = 'false';
    }

    if (!titleInput) return;

    const form = titleInput.closest('[data-admin-episode-form]');
    const slug = form?.querySelector('[data-admin-episode-slug]');
    if (!slug || slug.dataset.autoSlug === 'false') return;
    slug.value = slugify(titleInput.value);
  };
}

export async function renderAdminEpisodeManager(root) {
  state.root = root;

  if (!state.didInit) {
    state.didInit = true;
    render();
    await Promise.all([loadMovies(), loadEpisodes()]);
    render();
    return;
  }

  render();
}
