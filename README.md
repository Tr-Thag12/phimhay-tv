# PhimHay TV - Base Project

Đây là base project front-end cho website xem phim PhimHay TV. Project đang chạy bằng Vite, HTML/CSS/JavaScript thuần và vẫn là frontend mock, chưa có backend/database.

Branch refactor module hiện tại: `feature/refactor-modules`.

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
- Lưu phim bằng `localStorage`
- Lịch sử xem bằng `localStorage`
- Responsive mobile/tablet/desktop

## Ghi chú phát triển

- Dữ liệu mẫu hiện nằm trong `src/data/movies.js`.
- Luồng render chính bắt đầu từ `src/main.js`, qua `src/router/router.js`, rồi tới các file view trong `src/render/`.
- Search, watchlist và history nằm trong `src/features/`.
- Chưa có backend, API thật, database, admin hoặc đăng nhập thật.
