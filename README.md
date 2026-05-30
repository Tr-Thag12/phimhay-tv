# PhimHay TV - Base Project

Đây là base project front-end cho website xem phim PhimHay TV. Project đang chạy bằng Vite, HTML/CSS/JavaScript thuần và vẫn là frontend mock, chưa có backend/database.

Branch phát triển routing/SEO của bước này: `feature/url-routing-seo`.

```txt
phimhay-tv-base/
├─ index.html
├─ css/
│  └─ style.css
├─ src/
│  ├─ main.js
│  ├─ data/
│  ├─ state/
│  ├─ router/
│  ├─ utils/
│  ├─ render/
│  └─ features/
├─ assets/
├─ BACKEND_PLAN.md
├─ TODO.md
├─ PROJECT_MAP.md
├─ docs/
│  └─ UI_REDESIGN_NOTES.md
├─ package.json
└─ vite.config.mjs
```

## Cách chạy

Cài dependency:

```bash
npm install
```

Chạy dev server:

```bash
npm run dev
```

Sau đó mở URL Vite hiển thị trong terminal, thường là:

```txt
http://localhost:5173
```

Build production:

```bash
npm run build
```

Preview bản build:

```bash
npm run preview
```

## Đã có sẵn

- Trang chủ
- Trang danh sách phim + bộ lọc
- Trang chi tiết phim + tab
- Trang xem phim/player giả lập
- Trang tài khoản mock
- Tìm kiếm overlay
- URL routing bằng History API, không dùng hash route
- SEO meta cơ bản: `document.title`, meta description và canonical theo route
- Lưu phim bằng `localStorage`
- Lịch sử xem bằng `localStorage`
- Responsive mobile/tablet/desktop
- Giao diện dark cinematic V1 cho trải nghiệm giống nền tảng streaming hiện đại

## Route chính

- `/`: Trang chủ
- `/phim-le`: Danh sách phim lẻ
- `/phim-bo`: Danh sách phim bộ
- `/the-loai/:slug`: Danh sách phim theo thể loại
- `/phim/:slug`: Chi tiết phim
- `/xem/:slug/tap-:episode`: Player giả lập
- `/tim-kiem?q=keyword`: Trang kết quả tìm kiếm
- `/tai-khoan`: Tài khoản mock

## Ghi chú phát triển

- Dữ liệu mẫu hiện nằm trong `src/data/movies.js`.
- Luồng render chính bắt đầu từ `src/main.js`, qua `src/router/router.js`, đọc URL hiện tại rồi tới các file view trong `src/render/`.
- Search, watchlist và history nằm trong `src/features/`.
- Giao diện chính nằm trong `css/style.css`, dùng CSS variables và chia nhóm style theo base, header, hero, card phim, listing, detail, player, search, account và responsive.
- Chưa có backend, API thật, database, admin hoặc đăng nhập thật.
