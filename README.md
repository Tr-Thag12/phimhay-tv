# PhimHay TV - Base Project

Đây là base project front-end cho website xem phim PhimHay TV. Project đang chạy bằng Vite, HTML/CSS/JavaScript thuần và vẫn là frontend mock, chưa có backend/database.

Demo Vercel: https://phimhay-tv.vercel.app/

Branch thiết kế backend schema/API của bước này: `docs/thiet-ke-backend-schema-api`.

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
│  ├─ PROJECT_STATUS.md
│  ├─ USER_FLOWS.md
│  ├─ FEATURE_ROADMAP.md
│  ├─ BACKEND_PLAN.md
│  ├─ DATABASE_SCHEMA.md
│  ├─ API_CONTRACT.md
│  ├─ SECURITY_PLAN.md
│  ├─ BACKEND_TASKS.md
│  ├─ NEXT_STEPS.md
│  ├─ UI_REDESIGN_NOTES.md
│  ├─ ROUTING_SEO_NOTES.md
│  └─ DEPLOYMENT_NOTES.md
├─ package.json
├─ vercel.json
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

## Demo online

Bản demo online đang chạy tại:

```txt
https://phimhay-tv.vercel.app/
```

Đây là bản frontend mock để xem giao diện, routing URL, search, watchlist/history bằng `localStorage` và player giả lập. Project chưa có backend, database, admin hoặc đăng nhập thật.

## Tài liệu dự án

- [Trạng thái dự án](docs/PROJECT_STATUS.md)
- [Luồng người dùng](docs/USER_FLOWS.md)
- [Roadmap chức năng](docs/FEATURE_ROADMAP.md)
- [Kế hoạch backend](docs/BACKEND_PLAN.md)
- [Thiết kế database schema](docs/DATABASE_SCHEMA.md)
- [API contract backend](docs/API_CONTRACT.md)
- [Security plan](docs/SECURITY_PLAN.md)
- [Task backend](docs/BACKEND_TASKS.md)
- [Bước tiếp theo](docs/NEXT_STEPS.md)

## Deploy Vercel

Production hiện tại:

```txt
https://phimhay-tv.vercel.app/
```

Có thể deploy demo bằng Vercel Dashboard:

1. Import repo GitHub `Tr-Thag12/phimhay-tv`.
2. Chọn Framework Preset: `Vite`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Production branch: `main`.

Ghi chú:

- Project đang dùng URL routing bằng History API.
- File `vercel.json` dùng rewrites để reload các route con như `/phim-le`, `/phim/bong-dem-sai-gon`, `/xem/bong-dem-sai-gon/tap-1` không bị 404 ở production.
- Đây vẫn là frontend mock, chưa có backend/database.

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
