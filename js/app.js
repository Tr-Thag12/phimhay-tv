const app = document.getElementById('app');
const { MOVIES, USER } = window;
let state = {
  page: 'home',
  selectedMovieId: 1,
  currentEpisodeId: 's1e1',
  filters: { genre: 'Tất cả', country: 'Tất cả', year: 'Tất cả', type: 'Tất cả', sort: 'Mới nhất', keyword: '' },
  detailTab: 'overview',
  accountTab: 'profile',
  season: 1
};

const STORAGE_KEYS = {
  watchlist: 'phimhay_watchlist',
  history: 'phimhay_history'
};

function $(selector, root = document) { return root.querySelector(selector); }
function $all(selector, root = document) { return [...root.querySelectorAll(selector)]; }
function movieById(id) { return MOVIES.find(movie => movie.id === Number(id)) || MOVIES[0]; }
function icon(name) { return `<i data-lucide="${name}"></i>`; }
function createIcons() { if (window.lucide) lucide.createIcons(); }
function safeGet(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function safeSet(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
function getWatchlist() { return safeGet(STORAGE_KEYS.watchlist, [1, 4, 11]); }
function setWatchlist(ids) { safeSet(STORAGE_KEYS.watchlist, ids); }
function getHistory() { return safeGet(STORAGE_KEYS.history, [{ movieId: 1, episodeId: 's1e1', progress: 65 }, { movieId: 3, episodeId: null, progress: 30 }]); }
function setHistory(items) { safeSet(STORAGE_KEYS.history, items); }
function isSaved(movieId) { return getWatchlist().includes(Number(movieId)); }
function stars(rating) { const full = Math.round(rating / 2); return '★'.repeat(full) + `<span class="star-empty">${'★'.repeat(5 - full)}</span>`; }
function typeLabel(type) { return type === 'series' ? 'Phim bộ' : type === 'animation' ? 'Hoạt hình' : 'Phim lẻ'; }
function escapeHTML(str = '') { return String(str).replace(/[&<>'"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[m])); }

function navigateTo(page, payload = {}) {
  closeSearch();
  closeMobileMenu();
  if (payload.movieId) state.selectedMovieId = Number(payload.movieId);
  if (payload.episodeId) state.currentEpisodeId = payload.episodeId;
  state.page = page;
  updateNavActive(page);
  render();
  window.scrollTo(0, 0);
}

function updateNavActive(page) {
  $all('.nav-link').forEach(link => link.classList.remove('active'));
  if (page === 'home') $('[data-page="home"]')?.classList.add('active');
  else if (['listing', 'detail', 'player'].includes(page)) $('[data-page="listing"]')?.classList.add('active');
}

function openSearch() {
  $('#search-overlay').classList.add('open');
  $('#search-input').focus();
  renderSearchResults('');
}
function closeSearch() { $('#search-overlay').classList.remove('open'); }
function closeMobileMenu() { $('#mobile-menu').classList.remove('open'); }
function toggleMobileMenu() { $('#mobile-menu').classList.toggle('open'); }

function toggleSave(movieId, event) {
  if (event) event.stopPropagation();
  movieId = Number(movieId);
  const ids = getWatchlist();
  const next = ids.includes(movieId) ? ids.filter(id => id !== movieId) : [movieId, ...ids];
  setWatchlist(next);
  render();
}

function playMovie(movieId, episodeId, event) {
  if (event) event.stopPropagation();
  state.selectedMovieId = Number(movieId);
  const movie = movieById(movieId);
  state.currentEpisodeId = episodeId || movie.episodes?.[0]?.id || null;
  const history = getHistory().filter(item => item.movieId !== Number(movieId));
  setHistory([{ movieId: Number(movieId), episodeId: state.currentEpisodeId, progress: state.currentEpisodeId ? 12 : 0 }, ...history].slice(0, 8));
  navigateTo('player');
}

function movieCard(movie, options = {}) {
  const saved = isSaved(movie.id);
  return `
    <article class="movie-card" onclick="navigateTo('detail',{movieId:${movie.id}})">
      <img src="${movie.poster}" alt="Poster ${escapeHTML(movie.title)}" width="300" height="450" loading="lazy">
      <div class="badges" style="position:absolute;top:9px;left:9px">
        <span class="badge ${movie.quality === '4K' ? 'red' : ''}">${movie.quality}</span>
        <span class="badge">${movie.age}</span>
      </div>
      <div class="movie-card-info">
        <h3 class="movie-card-title">${escapeHTML(movie.title)}</h3>
        <div class="movie-card-meta">${movie.year} • ${movie.genres[0]} • ${movie.rating}</div>
      </div>
      <div class="card-overlay">
        <div class="card-small-actions">
          <button class="round-btn red" type="button" aria-label="Xem phim" onclick="playMovie(${movie.id}, null, event)">${icon('play')}</button>
          <button class="round-btn ${saved ? 'active' : ''}" type="button" aria-label="${saved ? 'Bỏ lưu' : 'Lưu phim'}" onclick="toggleSave(${movie.id}, event)">${icon('bookmark')}</button>
        </div>
        <strong>${escapeHTML(movie.title)}</strong>
        <small>${escapeHTML(movie.description.slice(0, 82))}...</small>
      </div>
    </article>`;
}

function renderHome() {
  const hero = MOVIES[0];
  const continueItems = getHistory().map(item => ({ ...item, movie: movieById(item.movieId) })).filter(item => item.movie);
  const top = [...MOVIES].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const newest = [...MOVIES].sort((a, b) => b.year - a.year).slice(0, 8);
  app.innerHTML = `
    <section class="hero">
      <img class="hero-bg" src="${hero.backdrop}" alt="Backdrop ${escapeHTML(hero.title)}" width="1920" height="1080" loading="eager" fetchpriority="high">
      <div class="hero-content">
        <img class="hero-poster" src="${hero.poster}" alt="Poster ${escapeHTML(hero.title)}" width="360" height="540">
        <div>
          <div class="badges"><span class="badge red">TOP 1</span><span class="badge">${hero.quality}</span><span class="badge">${hero.age}</span><span class="badge gold">${hero.status}</span></div>
          <h1>${escapeHTML(hero.title)}</h1>
          <div class="meta"><span>${hero.year}</span><span>•</span><span>${typeLabel(hero.type)}</span><span>•</span><span>${hero.duration}</span><span>•</span><span>${hero.genres.join(', ')}</span></div>
          <p>${escapeHTML(hero.description)}</p>
          <div class="actions">
            <button class="btn btn-primary" type="button" onclick="playMovie(${hero.id})">${icon('play')} Xem ngay</button>
            <button class="btn btn-ghost" type="button" onclick="navigateTo('detail',{movieId:${hero.id}})">${icon('film')} Chi tiết</button>
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
          <article class="wide-card" onclick="playMovie(${item.movie.id}, '${item.episodeId || ''}')">
            <img src="${item.movie.backdrop}" alt="${escapeHTML(item.movie.title)}" width="640" height="360" loading="lazy">
            <div class="progress"><span style="width:${item.progress}%"></span></div>
            <div class="card-overlay" style="opacity:0" onclick="event.stopPropagation(); playMovie(${item.movie.id}, '${item.episodeId || ''}')">${icon('play')}<strong>${escapeHTML(item.movie.title)}</strong><small>Đã xem ${item.progress}%</small></div>
          </article>`).join('') : '<div class="empty-state">Bạn chưa xem phim nào.</div>'}
        </div>
      </section>
      <section class="section">
        <div class="section-head"><h2 class="section-title">Top 10 thịnh hành</h2></div>
        <div class="scroll-row">${top.map((movie, i) => `<article class="top-card" onclick="navigateTo('detail',{movieId:${movie.id}})"><span class="top-number">${i + 1}</span><img src="${movie.poster}" alt="${escapeHTML(movie.title)}" width="260" height="390" loading="lazy"></article>`).join('')}</div>
      </section>
      <section class="section">
        <div class="section-head"><h2 class="section-title">Phim mới cập nhật</h2><button class="btn btn-ghost" onclick="navigateTo('listing')">Xem tất cả</button></div>
        <div class="scroll-row">${newest.map(movie => movieCard(movie)).join('')}</div>
      </section>
      <section class="section">
        <div class="section-head"><h2 class="section-title">Khám phá theo thể loại</h2></div>
        <div class="chips">${['Hành động','Tình cảm','Kinh dị','Hài','Khoa học viễn tưởng','Cổ trang','Trinh thám'].map(g => `<button class="chip" onclick="state.filters.genre='${g}'; navigateTo('listing')">${g}</button>`).join('')}</div>
      </section>
    </div>`;
}

function filteredMovies() {
  const kw = state.filters.keyword.trim().toLowerCase();
  let movies = MOVIES.filter(movie => {
    const matchKeyword = !kw || `${movie.title} ${movie.originalTitle} ${movie.genres.join(' ')} ${movie.country}`.toLowerCase().includes(kw);
    const matchGenre = state.filters.genre === 'Tất cả' || movie.genres.includes(state.filters.genre);
    const matchCountry = state.filters.country === 'Tất cả' || movie.country === state.filters.country;
    const matchYear = state.filters.year === 'Tất cả' || String(movie.year) === String(state.filters.year);
    const matchType = state.filters.type === 'Tất cả' || typeLabel(movie.type) === state.filters.type;
    return matchKeyword && matchGenre && matchCountry && matchYear && matchType;
  });
  if (state.filters.sort === 'Xem nhiều') movies.sort((a,b) => parseFloat(b.views) - parseFloat(a.views));
  else if (state.filters.sort === 'Đánh giá') movies.sort((a,b) => b.rating - a.rating);
  else movies.sort((a,b) => b.year - a.year);
  return movies;
}

function filterGroup(label, key, values) {
  return `<div class="filter-group"><span class="filter-label">${label}</span><div class="chips">${values.map(value => `<button class="chip ${state.filters[key] === value ? 'active' : ''}" type="button" data-filter-key="${key}" data-filter-value="${value}">${value}</button>`).join('')}</div></div>`;
}

function renderListing() {
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
    <div class="movie-grid">${movies.map(movie => movieCard(movie)).join('') || '<div class="empty-state" style="grid-column:1/-1">Không tìm thấy phim phù hợp.</div>'}</div>
  </div>`;

  $('#listing-search')?.addEventListener('input', e => { state.filters.keyword = e.target.value; renderListing(); createIcons(); });
  $all('[data-filter-key]').forEach(btn => btn.addEventListener('click', () => {
    state.filters[btn.dataset.filterKey] = btn.dataset.filterValue;
    renderListing();
    createIcons();
  }));
}

function renderDetail() {
  const movie = movieById(state.selectedMovieId);
  const seasons = [...new Set((movie.episodes || []).map(ep => ep.season))];
  const seasonEpisodes = (movie.episodes || []).filter(ep => ep.season === state.season);
  const similar = MOVIES.filter(m => m.id !== movie.id && m.genres.some(g => movie.genres.includes(g))).slice(0, 8);
  app.innerHTML = `<div class="detail-page">
    <section class="detail-hero"><img src="${movie.backdrop}" alt="Backdrop ${escapeHTML(movie.title)}" width="1920" height="1080" loading="eager"></section>
    <div class="container">
      <div class="detail-content">
        <img class="detail-poster" src="${movie.poster}" alt="Poster ${escapeHTML(movie.title)}" width="460" height="690">
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
        ${seasons.length ? `<select class="select" style="max-width:180px;margin-bottom:16px" onchange="state.season=Number(this.value);renderDetail();createIcons();">${seasons.map(s => `<option value="${s}" ${state.season === s ? 'selected' : ''}>Phần ${s}</option>`).join('')}</select>
        <div class="episode-grid">${seasonEpisodes.map(ep => `<article class="episode-card ${ep.id === state.currentEpisodeId ? 'active' : ''}" onclick="playMovie(${movie.id}, '${ep.id}')"><img src="${ep.thumb}" alt="Tập ${ep.number}" width="260" height="146" loading="lazy"><div><strong>Tập ${ep.number}: ${escapeHTML(ep.title)}</strong><p class="muted">${ep.duration}</p></div></article>`).join('')}</div>` : '<div class="empty-state">Phim lẻ không có danh sách tập.</div>'}
      </div>
      <div class="tab-panel ${state.detailTab === 'trailer' ? 'active' : ''}"><div class="video-preview"><img src="${movie.trailer}" alt="Trailer ${escapeHTML(movie.title)}" width="1280" height="720" loading="lazy"><button class="play-big" aria-label="Phát trailer">${icon('play')}</button></div></div>
      <div class="tab-panel ${state.detailTab === 'cast' ? 'active' : ''}"><div class="cast-row">${(movie.cast?.length ? movie.cast : MOVIES[0].cast).map(c => `<article class="cast-card"><img src="${c.photo}" alt="${escapeHTML(c.name)}" width="160" height="160" loading="lazy"><strong>${escapeHTML(c.name)}</strong><p class="muted">${escapeHTML(c.role)}</p></article>`).join('')}</div></div>
      <div class="tab-panel ${state.detailTab === 'reviews' ? 'active' : ''}"><div class="review-list"><div class="account-card"><h2>${movie.rating}/10</h2><p class="stars">${stars(movie.rating)}</p><button class="btn btn-ghost">${icon('edit-3')} Viết đánh giá</button></div>${(movie.reviews?.length ? movie.reviews : MOVIES[0].reviews).map(r => `<div class="review-card"><strong>${escapeHTML(r.user)}</strong> <span class="stars">${stars(r.rating * 2)}</span><p class="muted">${escapeHTML(r.text)}</p><small class="muted">${r.time}</small></div>`).join('')}</div></div>
      <div class="tab-panel ${state.detailTab === 'similar' ? 'active' : ''}"><div class="scroll-row">${similar.map(m => movieCard(m)).join('')}</div></div>
    </div>
  </div>`;
}

function setDetailTab(tab) { state.detailTab = tab; renderDetail(); createIcons(); }

function renderPlayer() {
  const movie = movieById(state.selectedMovieId);
  const episode = movie.episodes?.find(ep => ep.id === state.currentEpisodeId) || movie.episodes?.[0];
  app.innerHTML = `<div class="player-page">
    <section class="player-shell"><div class="player-box">
      <img src="${movie.backdrop}" alt="Player ${escapeHTML(movie.title)}" width="1920" height="1080">
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
      <aside><h3>Danh sách tập</h3><div class="episode-list">${movie.episodes?.length ? movie.episodes.map(ep => `<div class="episode-row ${ep.id === state.currentEpisodeId ? 'active' : ''}" onclick="playMovie(${movie.id}, '${ep.id}')"><strong>${String(ep.number).padStart(2,'0')}</strong><span>${escapeHTML(ep.title)} • ${ep.duration}</span>${ep.id === state.currentEpisodeId ? '<small>Đang xem</small>' : ''}</div>`).join('') : '<div class="empty-state">Phim lẻ</div>'}</div></aside>
    </div>
    <div class="container section"><h2 class="section-title">Có thể bạn cũng thích</h2><div class="scroll-row">${MOVIES.filter(m => m.id !== movie.id).slice(0,8).map(movieCard).join('')}</div></div>
  </div>`;
}

function togglePlayerMenu(id) {
  $all('.player-menu').forEach(menu => { if (menu.id !== id) menu.classList.remove('open'); });
  document.getElementById(id)?.classList.toggle('open');
}

function renderAccount() {
  const watchlist = getWatchlist().map(movieById);
  const history = getHistory().map(item => ({ ...item, movie: movieById(item.movieId) }));
  const tabs = [ ['profile','Hồ sơ'], ['watchlist','Danh sách của tôi'], ['history','Lịch sử xem'], ['subscription','Gói dịch vụ'], ['devices','Thiết bị'], ['settings','Cài đặt'] ];
  app.innerHTML = `<div class="account-page container">
    <div class="profile-head"><img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=160&auto=format&fit=crop" alt="Avatar" width="80" height="80"><div><h1>${escapeHTML(USER.name)}</h1><p class="muted">${escapeHTML(USER.email)} • ${USER.plan}</p></div></div>
    <div class="account-layout">
      <aside class="account-sidebar">${tabs.map(([key,label]) => `<button class="account-tab ${state.accountTab === key ? 'active' : ''}" onclick="setAccountTab('${key}')">${label}</button>`).join('')}</aside>
      <section>
        <div class="account-panel ${state.accountTab === 'profile' ? 'active' : ''}"><div class="account-grid"><div class="account-card"><span class="muted">Họ tên</span><h3>${escapeHTML(USER.name)}</h3></div><div class="account-card"><span class="muted">Email</span><h3>${escapeHTML(USER.email)}</h3></div><div class="account-card"><span class="muted">Số điện thoại</span><h3>Chưa cập nhật</h3></div><div class="account-card"><span class="muted">Ngày tham gia</span><h3>${USER.joined}</h3></div></div></div>
        <div class="account-panel ${state.accountTab === 'watchlist' ? 'active' : ''}"><div class="movie-grid">${watchlist.length ? watchlist.map(movieCard).join('') : '<div class="empty-state" style="grid-column:1/-1">Chưa lưu phim nào.</div>'}</div></div>
        <div class="account-panel ${state.accountTab === 'history' ? 'active' : ''}">${history.map(item => `<div class="history-item" onclick="playMovie(${item.movie.id}, '${item.episodeId || ''}')"><img src="${item.movie.backdrop}" alt="${escapeHTML(item.movie.title)}" width="260" height="146"><div style="flex:1"><strong>${escapeHTML(item.movie.title)}</strong><p class="muted">Đã xem ${item.progress}%</p><div class="bar"><span style="width:${item.progress}%"></span></div></div></div>`).join('')}</div>
        <div class="account-panel ${state.accountTab === 'subscription' ? 'active' : ''}"><div class="account-card"><span class="badge red">Gói hiện tại</span><h2>Premium 4K</h2><p class="muted">99.000đ/tháng • Gia hạn 30/06/2026</p><button class="btn btn-primary">Nâng cấp gói</button></div></div>
        <div class="account-panel ${state.accountTab === 'devices' ? 'active' : ''}">${['Laptop Windows','iPhone','Smart TV'].map(d => `<div class="device-item">${icon('monitor')}<strong>${d}</strong><button class="btn btn-ghost" style="margin-left:auto">Đăng xuất thiết bị</button></div>`).join('')}</div>
        <div class="account-panel ${state.accountTab === 'settings' ? 'active' : ''}"><div class="account-card"><p>Phụ đề mặc định: <strong>Tiếng Việt</strong></p><p>Chất lượng phát: <strong>Tự động 4K</strong></p><p>Ngôn ngữ giao diện: <strong>Tiếng Việt</strong></p><p>Autoplay tập tiếp theo: <strong>Bật</strong></p><button class="btn btn-danger">Đăng xuất</button></div></div>
      </section>
    </div>
  </div>`;
}
function setAccountTab(tab) { state.accountTab = tab; renderAccount(); createIcons(); }

function renderSearchResults(keyword = '') {
  const kw = keyword.trim().toLowerCase();
  const results = MOVIES.filter(movie => !kw || `${movie.title} ${movie.genres.join(' ')} ${movie.country}`.toLowerCase().includes(kw)).slice(0, 6);
  $('#search-results').innerHTML = results.map(movie => `<article class="movie-card" onclick="navigateTo('detail',{movieId:${movie.id}})"><img src="${movie.poster}" alt="${escapeHTML(movie.title)}" width="220" height="330"><div class="movie-card-info"><h3 class="movie-card-title">${escapeHTML(movie.title)}</h3><div class="movie-card-meta">${movie.year} • ${movie.quality}</div></div></article>`).join('') || '<div class="empty-state">Không có kết quả.</div>';
  createIcons();
}

function render() {
  if (state.page === 'home') renderHome();
  if (state.page === 'listing') renderListing();
  if (state.page === 'detail') renderDetail();
  if (state.page === 'player') renderPlayer();
  if (state.page === 'account') renderAccount();
  createIcons();
}

function initEvents() {
  document.body.addEventListener('click', event => {
    const pageBtn = event.target.closest('[data-page]');
    if (pageBtn) {
      if (pageBtn.dataset.listType) state.filters.type = pageBtn.dataset.listType === 'series' ? 'Phim bộ' : 'Phim lẻ';
      navigateTo(pageBtn.dataset.page);
    }
    const suggestion = event.target.closest('[data-search]');
    if (suggestion) {
      $('#search-input').value = suggestion.dataset.search;
      renderSearchResults(suggestion.dataset.search);
    }
  });
  $('#open-search').addEventListener('click', openSearch);
  $('#close-search').addEventListener('click', closeSearch);
  $('#mobile-menu-btn').addEventListener('click', toggleMobileMenu);
  $('#search-input').addEventListener('input', e => renderSearchResults(e.target.value));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSearch(); closeMobileMenu(); } });
  document.addEventListener('click', e => { if (!e.target.closest('.player-menu-wrap')) $all('.player-menu').forEach(menu => menu.classList.remove('open')); });
}

Object.assign(window, {
  state,
  navigateTo,
  toggleSave,
  playMovie,
  setDetailTab,
  togglePlayerMenu,
  setAccountTab,
  renderDetail,
  createIcons
});

initEvents();
updateNavActive('home');
render();
