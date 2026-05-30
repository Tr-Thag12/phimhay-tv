function svgDataUri(label, ratio = 'poster') {
  const isWide = ratio === 'wide';
  const width = isWide ? 960 : 600;
  const height = isWide ? 540 : 900;
  const iconY = isWide ? 225 : 390;
  const textY = isWide ? 330 : 525;
  const subY = isWide ? 372 : 575;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#111827"/>
          <stop offset="45%" stop-color="#2a1018"/>
          <stop offset="100%" stop-color="#07080d"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="32%" r="58%">
          <stop offset="0%" stop-color="#ff6b35" stop-opacity=".42"/>
          <stop offset="100%" stop-color="#ff6b35" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <rect width="100%" height="100%" fill="url(#glow)"/>
      <rect x="28" y="28" width="${width - 56}" height="${height - 56}" rx="34" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="3"/>
      <g transform="translate(${width / 2 - 42} ${iconY - 42})">
        <rect x="0" y="0" width="84" height="84" rx="24" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.22)" stroke-width="2"/>
        <path d="M34 27v30l25-15z" fill="#ff6b35"/>
      </g>
      <text x="50%" y="${textY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${isWide ? 46 : 54}" font-weight="800" fill="#f8fafc">PhimHay</text>
      <text x="50%" y="${subY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${isWide ? 22 : 28}" font-weight="700" fill="rgba(248,250,252,.68)">${label}</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const fallbackImages = {
  poster: svgDataUri('Poster đang cập nhật'),
  backdrop: svgDataUri('Backdrop đang cập nhật', 'wide'),
  avatar: svgDataUri('Tài khoản')
};

export function imageFallbackAttr(type = 'poster') {
  const fallback = fallbackImages[type] || fallbackImages.poster;
  return `onerror="this.onerror=null;this.src='${fallback}';this.classList.add('image-fallback');"`;
}
