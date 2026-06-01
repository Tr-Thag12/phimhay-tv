# PROJECT_MAP

## Cấu trúc hiện tại

```txt
phimhay-tv-base/
├─ index.html
├─ css/
│  └─ style.css
├─ src/
│  ├─ main.js
│  ├─ data/
│  │  └─ movies.js
│  ├─ state/
│  │  └─ store.js
│  ├─ router/
│  │  └─ router.js
│  ├─ utils/
│  │  ├─ dom.js
│  │  ├─ format.js
│  │  ├─ imageFallback.js
│  │  ├─ seo.js
│  │  ├─ slug.js
│  │  └─ storage.js
│  ├─ render/
│  │  ├─ layout.js
│  │  ├─ homeView.js
│  │  ├─ listingView.js
│  │  ├─ detailView.js
│  │  ├─ playerView.js
│  │  ├─ accountView.js
│  │  ├─ searchView.js
│  │  └─ notFoundView.js
│  └─ features/
│     ├─ search.js
│     ├─ watchlist.js
│     └─ history.js
├─ assets/
├─ server/
│  ├─ package.json
│  ├─ package-lock.json
│  ├─ docker-compose.yml
│  ├─ .env.example
│  ├─ README.md
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  ├─ seed.js
│  │  └─ migrations/
│  └─ src/
│     ├─ app.js
│     ├─ server.js
│     ├─ config/
│     │  └─ env.js
│     ├─ routes/
│     │  ├─ index.js
│     │  └─ health.routes.js
│     ├─ middlewares/
│     │  ├─ notFound.js
│     │  └─ errorHandler.js
│     └─ utils/
│        └─ response.js
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
├─ BACKEND_PLAN.md
├─ TODO.md
├─ README.md
├─ package.json
├─ vercel.json
└─ vite.config.mjs
```

## Vai trò từng phần

- `index.html`: Khung HTML chính, giữ header, footer, search overlay, vùng `<main id="app"></main>`, CSS hiện tại và script module `/src/main.js`.
- `vercel.json`: Cấu hình Vercel cho SPA, rewrite mọi route về `/index.html` để reload URL con không bị 404. Demo production hiện ở `https://phimhay-tv.vercel.app/`.
- `server/`: Backend Node.js + Express + Prisma, chạy riêng với frontend. Hiện có health check, middleware lỗi cơ bản, PostgreSQL local bằng Docker Compose, Prisma migration đầu tiên, seed dữ liệu mẫu và tài liệu chạy backend.
- `server/package.json`: Package backend riêng, có script `dev`, `start`, `db:up`, `db:down`, `db:logs`, `db:migrate`, `db:seed`, `db:studio`, `prisma:generate` và `prisma:studio`.
- `server/docker-compose.yml`: Cấu hình PostgreSQL 16 local cho môi trường dev, dùng database `phimhay_tv` và volume `phimhay_tv_pgdata`.
- `server/.env.example`: Biến môi trường mẫu cho backend, gồm `PORT`, `NODE_ENV`, `DATABASE_URL` và `CLIENT_URL`.
- `server/prisma/schema.prisma`: Prisma schema cho các model chính như User, Movie, Episode, Category, Watchlist, WatchHistory, Rating, Comment, Report và Banner.
- `server/prisma/migrations/`: Migration Prisma đầu tiên tạo database schema local.
- `server/prisma/seed.js`: Seed dữ liệu mẫu cho countries, categories, users, movies, episodes, banners, watchlist, history, rating, comment và report.
- `server/src/app.js`: Tạo Express app, cấu hình `helmet`, `cors`, `morgan`, `express.json()`, mount route `/api` và middleware lỗi.
- `server/src/server.js`: Khởi động backend ở port cấu hình, mặc định `4000`, và log URL health check.
- `server/src/config/env.js`: Đọc biến môi trường bằng `dotenv`, export config và cảnh báo nếu thiếu `DATABASE_URL`.
- `server/src/routes/index.js`: Gom các route backend chính.
- `server/src/routes/health.routes.js`: Endpoint `GET /api/health` trả JSON xác nhận backend đang hoạt động.
- `server/src/middlewares/notFound.js`: Trả JSON 404 cho route backend không tồn tại.
- `server/src/middlewares/errorHandler.js`: Middleware xử lý lỗi chung, không lộ stack trace khi chạy production.
- `server/src/utils/response.js`: Helper format JSON response thành công và lỗi.
- `css/style.css`: Toàn bộ giao diện hiện tại theo phong cách dark cinematic V1, dùng CSS variables và các nhóm style rõ ràng cho base, header, hero, movie card, listing, detail, player, search, account và responsive.
- `src/main.js`: Điểm khởi động app, import data/router/features, expose tạm các handler cần cho inline `onclick`, khởi tạo event và render ban đầu.
- `src/data/movies.js`: Dữ liệu mẫu phim và user mock, export qua `movies` và `user`.
- `src/state/store.js`: State runtime của app như page hiện tại, phim đang chọn, tập đang xem, tab chi tiết, tab account, từ khóa search, trạng thái 404 và bộ lọc listing.
- `src/router/router.js`: Router URL thật bằng History API. File này intercept link nội bộ, gọi `pushState`, parse path hiện tại, cập nhật state, render view tương ứng và cập nhật SEO meta.
- `src/utils/storage.js`: Helper đọc/ghi/xóa `localStorage` an toàn bằng JSON, trả default value nếu dữ liệu lỗi.
- `src/utils/dom.js`: Helper DOM như `qs`, `qsa`, `setHTML`, `onClick`, `createIcons`.
- `src/utils/format.js`: Helper format/escape như `escapeHTML`, `stars`, `typeLabel`, `formatYear`, `formatDuration`, `formatRating`, `formatViewCount`.
- `src/utils/imageFallback.js`: Tạo ảnh fallback nội bộ dạng SVG data URI và thuộc tính xử lý `onerror` cho poster/backdrop/avatar.
- `src/utils/seo.js`: Helper cập nhật `document.title`, meta description và canonical, đồng thời tránh tạo trùng thẻ canonical.
- `src/utils/slug.js`: Helper tạo slug tiếng Việt, tìm phim/thể loại theo slug và tạo URL chi tiết/player/thể loại.
- `src/render/layout.js`: Các phần render dùng chung như active nav, empty state, movie card, icon, lookup movie, mobile menu và player menu.
- `src/render/homeView.js`: Render trang chủ, hero, tiếp tục xem, top phim, phim mới và thể loại.
- `src/render/listingView.js`: Render trang danh sách phim, search/filter/sort trong listing.
- `src/render/detailView.js`: Render trang chi tiết phim, tab, tập phim, trailer, diễn viên, đánh giá và phim tương tự.
- `src/render/playerView.js`: Render player giả lập và danh sách tập liên quan.
- `src/render/accountView.js`: Render tài khoản mock, watchlist, history, gói dịch vụ, thiết bị và cài đặt.
- `src/render/searchView.js`: Render trang kết quả tìm kiếm theo query `q` trên URL.
- `src/render/notFoundView.js`: Render trang 404 đơn giản, hợp theme và có link quay về trang chủ.
- `src/features/search.js`: Logic search overlay và render kết quả tìm kiếm.
- `src/features/watchlist.js`: Logic thêm/xóa watchlist, lưu qua `localStorage`.
- `src/features/history.js`: Logic history xem phim, lưu qua `localStorage`.
- `docs/PROJECT_STATUS.md`: Tổng kết trạng thái hiện tại của dự án, phần đã xong và phần chưa có.
- `docs/USER_FLOWS.md`: Danh sách luồng thao tác cho khách, người dùng đăng nhập, admin và hệ thống.
- `docs/FEATURE_ROADMAP.md`: Roadmap phát triển theo từng giai đoạn từ frontend mock đến production.
- `docs/BACKEND_PLAN.md`: Kế hoạch backend đề xuất, bảng dữ liệu và API endpoint.
- `docs/DATABASE_SCHEMA.md`: Thiết kế chi tiết database schema, quan hệ bảng, constraint, index và Prisma model draft.
- `docs/API_CONTRACT.md`: API contract dự kiến cho public/auth/user/admin API và response JSON mẫu.
- `docs/SECURITY_PLAN.md`: Nguyên tắc bảo mật cho auth, phân quyền, validate input, CORS, rate limit và xử lý lỗi.
- `docs/BACKEND_TASKS.md`: Task backend theo giai đoạn từ skeleton, database, public API đến admin.
- `docs/NEXT_STEPS.md`: Thứ tự việc nên làm tiếp theo theo mức ưu tiên.
- `docs/UI_REDESIGN_NOTES.md`: Ghi chú tiếng Việt về hướng thiết kế giao diện V1 và những điểm cần cải thiện ở bước sau.
- `docs/ROUTING_SEO_NOTES.md`: Ghi chú route, slug và SEO meta cơ bản.
- `docs/DEPLOYMENT_NOTES.md`: Ghi chú deploy Vercel, route cần kiểm tra và lý do chưa dùng GitHub Pages ở bước này.

## Luồng chạy hiện tại

1. Trình duyệt tải `index.html`.
2. `index.html` tải `css/style.css` và script module `/src/main.js`.
3. `src/main.js` import dữ liệu, router, state, features và helper chung.
4. Người dùng click link nội bộ như `/phim/:slug` hoặc `/xem/:slug/tap-1`.
5. `router/router.js` intercept event, gọi `history.pushState()`, parse path hiện tại, cập nhật state rồi render view tương ứng trong `src/render/`.
6. Khi bấm Back/Forward, listener `popstate` parse lại URL và render đúng view mà không reload trang.
7. Sau mỗi lần render route, `utils/seo.js` cập nhật title, description và canonical.
8. `features/search.js`, `features/watchlist.js`, `features/history.js` xử lý tìm kiếm overlay, danh sách lưu và lịch sử xem.
9. `utils/storage.js` lưu watchlist/history vào `localStorage` để reload không mất dữ liệu.
10. Khi deploy Vercel, `vercel.json` rewrite mọi request về `index.html`; app tự parse URL và render route đúng. Link demo hiện tại là `https://phimhay-tv.vercel.app/`.
11. Backend chạy riêng trong `server/`; khi chạy `npm run start` trong thư mục này, Express mount route `GET /api/health` tại `http://localhost:4000/api/health`.
12. Database dev chạy bằng `server/docker-compose.yml`; sau khi `npm run db:up`, Prisma dùng `DATABASE_URL` trong `server/.env` để migrate và seed dữ liệu mẫu.

## Route URL hiện có

- `/`: Trang chủ.
- `/phim-le`: Danh sách phim lẻ.
- `/phim-bo`: Danh sách phim bộ.
- `/the-loai/:slug`: Danh sách phim theo thể loại.
- `/phim/:slug`: Chi tiết phim.
- `/xem/:slug/tap-:episode`: Player giả lập.
- `/tim-kiem?q=keyword`: Trang kết quả tìm kiếm.
- `/tai-khoan`: Trang tài khoản mock.
- URL sai sẽ render `notFoundView.js`.

## Phạm vi hiện tại

- Đây vẫn là frontend mock chạy bằng Vite, HTML/CSS/JavaScript thuần; backend chạy riêng trong `server/`.
- Đã có PostgreSQL local, migration đầu tiên và seed dữ liệu mẫu cho backend dev.
- Chưa có API nghiệp vụ thật, admin hoặc đăng nhập thật.
- Không đổi cấu trúc dữ liệu phim mẫu. Dữ liệu hiện được dùng chính qua export module, còn `window.MOVIES`/`window.USER` chỉ được expose tạm trong `src/main.js` để tương thích khi cần kiểm tra nhanh.
- Chưa nên sửa lớn cấu trúc `src/data/movies.js`, watchlist/history trong `localStorage`, hoặc cách render view hiện tại nếu chưa sang bước backend/API.
