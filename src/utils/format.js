export function escapeHTML(str = '') {
  return String(str).replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}

export function stars(rating) {
  const full = Math.round(rating / 2);
  return '★'.repeat(full) + `<span class="star-empty">${'★'.repeat(5 - full)}</span>`;
}

export function typeLabel(type) {
  return type === 'series' ? 'Phim bộ' : type === 'animation' ? 'Hoạt hình' : 'Phim lẻ';
}

export function formatYear(year) {
  return String(year);
}

export function formatDuration(duration) {
  return duration;
}

export function formatRating(rating) {
  return Number(rating).toFixed(1).replace('.0', '');
}

export function formatViewCount(views) {
  return views;
}
