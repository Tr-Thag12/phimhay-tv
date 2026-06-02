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
│  │  ├─ movies.js
│  │  ├─ movieRepository.js
│  │  └─ userLibraryRepository.js
│  ├─ services/
│  │  ├─ apiClient.js
│  │  ├─ authApi.js
│  │  ├─ authStorage.js
│  │  ├─ adminApi.js
│  │  ├─ adminMovieApi.js
│  │  ├─ adminEpisodeApi.js
│  │  ├─ movieApi.js
│  │  ├─ movieAdapter.js
│  │  └─ userLibraryApi.js
│  ├─ state/
│  │  ├─ store.js
│  │  └─ authStore.js
│  ├─ router/
│  │  └─ router.js
│  ├─ utils/
│  │  ├─ dom.js
│  │  ├─ format.js
│  │  ├─ adminGuard.js
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
│  │  ├─ adminView.js
│  │  ├─ adminMovieView.js
│  │  ├─ adminEpisodeView.js
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
│     ├─ lib/
│     │  └─ prisma.js
│     ├─ services/
│     │  ├─ movie.service.js
│     │  ├─ adminMovie.service.js
│     │  ├─ adminEpisode.service.js
│     │  ├─ category.service.js
│     │  ├─ auth.service.js
│     │  ├─ userWatchlist.service.js
│     │  └─ userHistory.service.js
│     ├─ controllers/
│     │  ├─ movie.controller.js
│     │  ├─ category.controller.js
│     │  ├─ search.controller.js
│     │  ├─ auth.controller.js
│     │  ├─ userWatchlist.controller.js
│     │  ├─ userHistory.controller.js
│     │  ├─ admin.controller.js
│     │  ├─ adminMovie.controller.js
│     │  └─ adminEpisode.controller.js
│     ├─ routes/
│     │  ├─ index.js
│     │  ├─ health.routes.js
│     │  ├─ movie.routes.js
│     │  ├─ category.routes.js
│     │  ├─ search.routes.js
│     │  ├─ auth.routes.js
│     │  ├─ me.routes.js
│     │  ├─ admin.routes.js
│     │  ├─ adminMovie.routes.js
│     │  └─ adminEpisode.routes.js
│     ├─ middlewares/
│     │  ├─ notFound.js
│     │  ├─ errorHandler.js
│     │  ├─ authMiddleware.js
│     │  └─ requireAdmin.js
│     ├─ validators/
│     │  ├─ auth.validator.js
│     │  ├─ adminMovie.validator.js
│     │  └─ adminEpisode.validator.js
│     └─ utils/
│        ├─ response.js
│        └─ pagination.js
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
│  ├─ FRONTEND_API_INTEGRATION.md
│  ├─ FULLSTACK_LOCAL_GUIDE.md
│  ├─ DEPLOYMENT_NOTES.md
│  ├─ AUTH_BACKEND_NOTES.md
│  ├─ FRONTEND_AUTH_NOTES.md
│  ├─ USER_LIBRARY_SYNC_NOTES.md
│  ├─ ADMIN_SHELL_NOTES.md
│  ├─ ADMIN_MOVIE_API_NOTES.md
│  ├─ ADMIN_MOVIE_UI_NOTES.md
│  ├─ ADMIN_EPISODE_API_NOTES.md
│  └─ ADMIN_EPISODE_UI_NOTES.md
├─ BACKEND_PLAN.md
├─ TODO.md
├─ README.md
├─ .env.example
├─ package.json
├─ vercel.json
└─ vite.config.mjs
```

## Vai trò từng phần

- `index.html`: Khung HTML chính, giữ header, footer, search overlay, vùng `<main id="app"></main>`, CSS hiện tại và script module `/src/main.js`.
- `.env.example`: Biến môi trường mẫu cho frontend, hiện có `VITE_API_BASE_URL=http://localhost:4000/api`.
- `vercel.json`: Cấu hình Vercel cho SPA, rewrite mọi route về `/index.html` để reload URL con không bị 404. Demo production hiện ở `https://phimhay-tv.vercel.app/`.
- `server/`: Backend Node.js + Express + Prisma, chạy riêng với frontend. Hiện có health check, API public, Auth API cơ bản bằng JWT, API `/api/me` cho watchlist/history theo user, API `/api/admin/health`, Admin Movie API backend, Admin Episode API backend, middleware lỗi cơ bản, PostgreSQL local bằng Docker Compose, Prisma migration đầu tiên, seed dữ liệu mẫu và tài liệu chạy backend.
- `server/package.json`: Package backend riêng, có script `dev`, `start`, `db:up`, `db:down`, `db:logs`, `db:migrate`, `db:seed`, `db:studio`, `prisma:generate` và `prisma:studio`.
- `server/docker-compose.yml`: Cấu hình PostgreSQL 16 local cho môi trường dev, dùng database `phimhay_tv` và volume `phimhay_tv_pgdata`.
- `server/.env.example`: Biến môi trường mẫu cho backend, gồm `PORT`, `NODE_ENV`, `DATABASE_URL`, `CLIENT_URL`, `JWT_SECRET` và `JWT_EXPIRES_IN`.
- `server/prisma/schema.prisma`: Prisma schema cho các model chính như User, Movie, Episode, Category, Watchlist, WatchHistory, Rating, Comment, Report và Banner.
- `server/prisma/migrations/`: Migration Prisma đầu tiên tạo database schema local.
- `server/prisma/seed.js`: Seed dữ liệu mẫu cho countries, categories, users, movies, episodes, banners, watchlist, history, rating, comment và report.
- `server/src/app.js`: Tạo Express app, cấu hình `helmet`, `cors`, `morgan`, `express.json()`, mount route `/api` và middleware lỗi.
- `server/src/server.js`: Khởi động backend ở port cấu hình, mặc định `4000`, và log URL health check.
- `server/src/config/env.js`: Đọc biến môi trường bằng `dotenv`, export config và cảnh báo nếu thiếu `DATABASE_URL`.
- `server/src/lib/prisma.js`: Tạo Prisma Client dùng chung cho backend, tránh tạo nhiều instance rời rạc.
- `server/src/services/movie.service.js`: Logic đọc danh sách phim, chi tiết phim, tập phim và tăng lượt xem từ PostgreSQL qua Prisma.
- `server/src/services/adminMovie.service.js`: Logic admin CRUD phim cho list/detail/create/update/delete mềm/publish/featured, kiểm tra slug unique, country/category tồn tại và cập nhật quan hệ MovieCategory an toàn.
- `server/src/services/adminEpisode.service.js`: Logic admin CRUD tập phim cho list/detail/create/update/delete mềm/publish, kiểm tra movie tồn tại, chống trùng `movieId + episodeNumber` và `movieId + slug`.
- `server/src/services/category.service.js`: Logic đọc danh sách thể loại và phim theo thể loại.
- `server/src/services/auth.service.js`: Logic đăng ký, đăng nhập, tạo JWT, lấy user hiện tại và chuyển user sang response an toàn không lộ password hash.
- `server/src/services/userWatchlist.service.js`: Logic lấy/thêm/xóa watchlist theo `req.user.id`, include movie/country/categories và không tạo trùng userId + movieId.
- `server/src/services/userHistory.service.js`: Logic lấy/tạo/cập nhật/xóa lịch sử xem theo `req.user.id`, include movie/episode và cập nhật `watchedAt` khi xem tiếp.
- `server/src/controllers/movie.controller.js`: Controller public cho danh sách phim, chi tiết phim, tập phim và tăng lượt xem.
- `server/src/controllers/category.controller.js`: Controller public cho danh sách thể loại và phim theo thể loại.
- `server/src/controllers/search.controller.js`: Controller public cho `GET /api/search?q=keyword`.
- `server/src/controllers/auth.controller.js`: Controller auth cho register, login, me và logout.
- `server/src/controllers/userWatchlist.controller.js`: Controller user watchlist cho `GET/POST/DELETE /api/me/watchlist`.
- `server/src/controllers/userHistory.controller.js`: Controller user history cho `GET/POST/DELETE /api/me/history`.
- `server/src/controllers/admin.controller.js`: Controller admin health trả trạng thái khu vực admin cho user ADMIN đã qua middleware.
- `server/src/controllers/adminMovie.controller.js`: Controller Admin Movie API, validate body bằng `zod`, trả response JSON thống nhất cho thao tác quản trị phim.
- `server/src/controllers/adminEpisode.controller.js`: Controller Admin Episode API, validate body bằng `zod`, trả response JSON thống nhất cho thao tác quản trị tập phim.
- `server/src/routes/index.js`: Gom các route backend chính và mount `/health`, `/auth`, `/movies`, `/categories`, `/search`, `/me`, `/admin`.
- `server/src/routes/health.routes.js`: Endpoint `GET /api/health` trả JSON xác nhận backend đang hoạt động.
- `server/src/routes/movie.routes.js`: Route public cho movies.
- `server/src/routes/category.routes.js`: Route public cho categories.
- `server/src/routes/search.routes.js`: Route public cho search.
- `server/src/routes/auth.routes.js`: Route auth cho `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout` và rate limit nhẹ cho register/login.
- `server/src/routes/me.routes.js`: Route cần JWT cho `/api/me/watchlist` và `/api/me/history`.
- `server/src/routes/admin.routes.js`: Route admin chung, áp dụng `authMiddleware` và `requireAdmin`, mount `GET /api/admin/health`, `/api/admin/movies` và `/api/admin/episodes`.
- `server/src/routes/adminMovie.routes.js`: Route Admin Movie API cho `GET/POST/PATCH/DELETE /api/admin/movies`.
- `server/src/routes/adminEpisode.routes.js`: Route Admin Episode API cho `GET/POST/PATCH/DELETE /api/admin/episodes` và `PATCH /api/admin/episodes/:id/publish`.
- `server/src/middlewares/notFound.js`: Trả JSON 404 cho route backend không tồn tại.
- `server/src/middlewares/errorHandler.js`: Middleware xử lý lỗi chung, không lộ stack trace khi chạy production.
- `server/src/middlewares/authMiddleware.js`: Middleware đọc JWT Bearer token, verify token, lấy user từ database và gắn user an toàn vào `req.user`.
- `server/src/middlewares/requireAdmin.js`: Middleware kiểm tra `req.user.role === "ADMIN"` để chuẩn bị cho admin sau này.
- `server/src/validators/auth.validator.js`: Validator `zod` cho register/login và helper format lỗi validation.
- `server/src/validators/adminMovie.validator.js`: Validator `zod` cho create/update/publish/featured Admin Movie API.
- `server/src/validators/adminEpisode.validator.js`: Validator `zod` cho create/update/publish Admin Episode API.
- `server/src/utils/response.js`: Helper format JSON response thành công và lỗi.
- `server/src/utils/pagination.js`: Helper parse `page`, `limit` và tạo metadata phân trang cho API.
- `css/style.css`: Toàn bộ giao diện hiện tại theo phong cách dark cinematic V1, dùng CSS variables và các nhóm style rõ ràng cho base, header, hero, movie card, listing, detail, player, search, account và responsive.
- `src/main.js`: Điểm khởi động app, import data/router/features/auth, expose tạm các handler cần cho inline `onclick`, khởi tạo event, khởi tạo auth bằng `initAuth()` và render ban đầu.
- `src/data/movies.js`: Dữ liệu mẫu phim và user mock, export qua `movies` và `user`; dữ liệu này vẫn được giữ làm fallback khi backend không khả dụng.
- `src/data/movieRepository.js`: Repository dữ liệu frontend, ưu tiên gọi API public backend, cache dữ liệu đã tải và fallback về `src/data/movies.js` khi API lỗi hoặc backend tắt; đồng thời giữ `apiId` cho phim backend trùng slug mock để các feature user library gọi đúng id backend.
- `src/data/userLibraryRepository.js`: Repository watchlist/history frontend, ưu tiên `/api/me` khi user đã đăng nhập và token còn, fallback localStorage khi chưa đăng nhập hoặc backend lỗi.
- `src/services/apiClient.js`: Client gọi API dùng `VITE_API_BASE_URL`, parse JSON response, có timeout request để fallback/offline UI không bị treo, ném lỗi thống nhất khi backend trả lỗi và hỗ trợ `auth: true` để gắn `Authorization: Bearer <token>`.
- `src/services/authApi.js`: Nhóm hàm gọi Auth API frontend cho register, login, me và logout.
- `src/services/authStorage.js`: Helper đọc/ghi/xóa JWT auth trong `sessionStorage` bằng key `phimhay_auth_token`.
- `src/services/adminApi.js`: Hàm gọi `GET /api/admin/health` với `auth: true` để xác thực admin shell từ backend.
- `src/services/adminMovieApi.js`: Nhóm hàm frontend gọi Admin Movie API với `auth: true`, gồm list/detail/create/update/delete mềm/toggle publish/toggle featured, không hard-code localhost và không fake dữ liệu khi backend lỗi.
- `src/services/adminEpisodeApi.js`: Nhóm hàm frontend gọi Admin Episode API với `auth: true`, gồm list/detail/create/update/delete mềm/toggle publish, không hard-code localhost và không fake dữ liệu khi backend lỗi.
- `src/services/movieApi.js`: Nhóm hàm gọi API public `/movies`, `/categories`, `/search` và tăng lượt xem.
- `src/services/movieAdapter.js`: Chuyển dữ liệu backend sang shape cũ mà các view đang dùng như `poster`, `backdrop`, `genres`, `episodes`, `rating`.
- `src/services/userLibraryApi.js`: Nhóm hàm gọi `/me/watchlist` và `/me/history` với `auth: true`.
- `src/state/store.js`: State runtime của app như page hiện tại, phim đang chọn, tập đang xem, tab chi tiết, tab account, mode form auth, từ khóa search, trạng thái 404, bộ lọc listing, dữ liệu route hiện tại, kết quả search, nguồn dữ liệu và lỗi API gần nhất.
- `src/state/authStore.js`: State auth frontend gồm user, token, trạng thái đăng nhập/loading/error, khởi tạo `/api/auth/me`, login, register, logout và subscribe khi auth đổi.
- `src/router/router.js`: Router URL thật bằng History API. File này intercept link nội bộ, gọi `pushState`, parse path hiện tại, tải dữ liệu async qua `movieRepository`, cập nhật state, render view tương ứng và cập nhật SEO meta.
- `src/utils/storage.js`: Helper đọc/ghi/xóa `localStorage` an toàn bằng JSON, trả default value nếu dữ liệu lỗi.
- `src/utils/dom.js`: Helper DOM như `qs`, `qsa`, `setHTML`, `onClick`, `createIcons`.
- `src/utils/format.js`: Helper format/escape như `escapeHTML`, `stars`, `typeLabel`, `formatYear`, `formatDuration`, `formatRating`, `formatViewCount`.
- `src/utils/adminGuard.js`: Guard frontend cho route `/admin`, phân biệt loading, chưa đăng nhập, user không đủ quyền và admin cần kiểm tra backend.
- `src/utils/imageFallback.js`: Tạo ảnh fallback nội bộ dạng SVG data URI và thuộc tính xử lý `onerror` cho poster/backdrop/avatar.
- `src/utils/seo.js`: Helper cập nhật `document.title`, meta description và canonical, đồng thời tránh tạo trùng thẻ canonical.
- `src/utils/slug.js`: Helper tạo slug tiếng Việt, tìm phim/thể loại theo slug và tạo URL chi tiết/player/thể loại.
- `src/render/layout.js`: Các phần render dùng chung như active nav, trạng thái auth trên header, empty state, movie card, icon, lookup movie, mobile menu và player menu.
- `src/render/homeView.js`: Render trang chủ, hero, tiếp tục xem, top phim, phim mới và thể loại.
- `src/render/listingView.js`: Render trang danh sách phim, search/filter/sort trong listing.
- `src/render/detailView.js`: Render trang chi tiết phim, tab, tập phim, trailer, diễn viên, đánh giá và phim tương tự.
- `src/render/playerView.js`: Render player giả lập và danh sách tập liên quan.
- `src/render/accountView.js`: Render form đăng nhập/đăng ký thật qua Auth API, hồ sơ user hiện tại, logout, watchlist/history theo repository backend/localStorage fallback, gói dịch vụ demo, thiết bị và cài đặt.
- `src/render/adminView.js`: Render route `/admin`, chặn user chưa đăng nhập hoặc không phải ADMIN, gọi `adminApi.health` trước khi hiển thị admin shell, tab tổng quan, tab quản lý phim và tab quản lý tập phim thật.
- `src/render/adminMovieView.js`: Render UI CRUD phim trong `/admin`, gồm toolbar tải lại/thêm phim/tìm kiếm/lọc, bảng danh sách, phân trang, modal form thêm/sửa, modal chi tiết, toggle publish/featured, xóa mềm và trạng thái loading/error/success.
- `src/render/adminEpisodeView.js`: Render UI CRUD tập phim trong `/admin`, gồm toolbar tải lại/thêm tập/tìm kiếm/lọc theo phim/trạng thái, bảng danh sách, phân trang, modal form thêm/sửa, modal chi tiết, toggle publish, xóa mềm và trạng thái loading/error/success.
- `src/render/searchView.js`: Render trang kết quả tìm kiếm theo query `q` trên URL.
- `src/render/notFoundView.js`: Render trang 404 đơn giản, hợp theme và có link quay về trang chủ.
- `src/features/search.js`: Logic search overlay và render kết quả tìm kiếm.
- `src/features/watchlist.js`: Wrapper giữ API cũ cho thêm/xóa watchlist, delegate sang `userLibraryRepository` để dùng backend khi auth hoặc localStorage fallback.
- `src/features/history.js`: Wrapper giữ API cũ cho lịch sử xem, delegate sang `userLibraryRepository` để dùng backend khi auth hoặc localStorage fallback.
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
- `docs/FRONTEND_API_INTEGRATION.md`: Ghi chú cách frontend gọi API public, fallback về mock data và các route cần kiểm thử.
- `docs/FULLSTACK_LOCAL_GUIDE.md`: Hướng dẫn chạy fullstack local bằng 3 terminal, test API/frontend/fallback, kiểm tra data source và xử lý lỗi thường gặp.
- `docs/DEPLOYMENT_NOTES.md`: Ghi chú deploy Vercel, route cần kiểm tra và lý do chưa dùng GitHub Pages ở bước này.
- `docs/AUTH_BACKEND_NOTES.md`: Ghi chú Auth backend hiện tại, JWT Bearer token, giới hạn hiện có và user mẫu local dev.
- `docs/FRONTEND_AUTH_NOTES.md`: Ghi chú luồng frontend auth, sessionStorage token, init `/api/auth/me`, logout và giới hạn bảo mật hiện tại.
- `docs/USER_LIBRARY_SYNC_NOTES.md`: Ghi chú luồng đồng bộ watchlist/history theo tài khoản, endpoint `/api/me` và fallback localStorage.
- `docs/ADMIN_SHELL_NOTES.md`: Ghi chú admin shell local, luồng guard `/admin`, endpoint `/api/admin/health` và các trường hợp bị chặn.
- `docs/ADMIN_MOVIE_API_NOTES.md`: Ghi chú Admin Movie API backend, route cần ADMIN, luồng xử lý, validation, delete mềm và trạng thái frontend CRUD phim đã được nối ở `/admin`.
- `docs/ADMIN_MOVIE_UI_NOTES.md`: Ghi chú giao diện admin quản lý phim, luồng từ ADMIN login đến Admin Movie API, chức năng UI và giới hạn chưa upload file/chưa CRUD các nhóm khác.
- `docs/ADMIN_EPISODE_API_NOTES.md`: Ghi chú Admin Episode API backend, route cần ADMIN, luồng xử lý, validation, chống trùng tập, delete mềm và publish toggle.
- `docs/ADMIN_EPISODE_UI_NOTES.md`: Ghi chú giao diện admin quản lý tập phim, luồng từ ADMIN login đến Admin Episode API, chức năng UI và giới hạn chưa upload video/thumbnail thật.

## Luồng chạy hiện tại

### Luồng frontend gọi API public

```txt
View trong src/render/
→ src/router/router.js
→ src/data/movieRepository.js
→ src/services/movieApi.js
→ src/services/apiClient.js
→ Backend API /api
→ server/src/controllers/
→ server/src/services/
→ Prisma Client
→ PostgreSQL local
```

`movieRepository.js` là lớp quyết định nguồn dữ liệu cho frontend. Khi API thành công, runtime state có `dataSource` là `api`.

### Luồng fallback mock

```txt
API lỗi hoặc backend tắt
→ movieRepository bắt lỗi
→ fallback về src/data/movies.js
→ cache/state frontend cập nhật
→ view vẫn render bằng dữ liệu mock
```

Khi fallback xảy ra, runtime state có `dataSource` là `mock`; lỗi gần nhất nằm ở `window.state.dataError`. Warning mạng như `ERR_CONNECTION_REFUSED` hoặc `Failed to fetch` là bình thường khi cố tình tắt backend để test fallback.

### Luồng frontend auth

```txt
Form đăng nhập/đăng ký trong src/render/accountView.js
→ src/state/authStore.js
→ src/services/authApi.js
→ src/services/apiClient.js
→ Backend /api/auth
→ sessionStorage + auth state
→ render lại header/account
```

Khi app khởi động, `src/main.js` gọi `initAuth()`. Nếu `sessionStorage` còn token, frontend gọi `/api/auth/me` để khôi phục user; nếu token sai hoặc hết hạn thì token bị xóa và app quay về trạng thái chưa đăng nhập. Nếu backend auth không kết nối được, token được giữ lại nhưng user không được xem là đã xác thực; route admin vẫn phải gọi `/api/admin/health` và không fallback admin giả.

### Luồng watchlist/history theo tài khoản

```txt
src/features/watchlist.js hoặc src/features/history.js
→ src/data/userLibraryRepository.js
→ nếu đã đăng nhập và có id backend thì gọi src/services/userLibraryApi.js
→ Backend /api/me
→ authMiddleware
→ userWatchlist/userHistory controller
→ userWatchlist/userHistory service
→ Prisma Watchlist/WatchHistory
```

Nếu user chưa đăng nhập, backend tắt hoặc phim chỉ có dữ liệu mock không có id backend, repository giữ nguyên fallback `localStorage` để UI không crash.

### Luồng Admin Movie API backend

```txt
Admin login
→ JWT Bearer token
→ /api/admin/movies
→ authMiddleware
→ requireAdmin
→ adminMovieController
→ adminMovieService
→ Prisma Movie/Country/Category/MovieCategory
→ PostgreSQL local
```

Admin Movie API hiện đã được nối với frontend `/admin` qua `src/services/adminMovieApi.js` và `src/render/adminMovieView.js`. ADMIN có thể quản lý phim trong tab `Quản lý phim`; các nhóm tập phim, thể loại, user và bình luận/báo lỗi vẫn chưa làm.

### Luồng Admin Episode API backend

```txt
Admin login
→ JWT Bearer token
→ /api/admin/episodes
→ authMiddleware
→ requireAdmin
→ adminEpisodeController
→ adminEpisodeService
→ Prisma Episode/Movie
→ PostgreSQL local
```

Admin Episode API hiện đã được nối với frontend `/admin` qua `src/services/adminEpisodeApi.js` và `src/render/adminEpisodeView.js`. ADMIN có thể quản lý tập phim trong tab `Quản lý tập phim`; các nhóm thể loại, user và bình luận/báo lỗi vẫn chưa làm.

1. Trình duyệt tải `index.html`.
2. `index.html` tải `css/style.css` và script module `/src/main.js`.
3. `src/main.js` import dữ liệu mock, router, state, auth store, features và helper chung.
4. Người dùng click link nội bộ như `/phim/:slug` hoặc `/xem/:slug/tap-1`.
5. `router/router.js` intercept event, gọi `history.pushState()`, parse path hiện tại, tải dữ liệu qua `src/data/movieRepository.js`, cập nhật state rồi render view tương ứng trong `src/render/`.
6. Khi bấm Back/Forward, listener `popstate` parse lại URL và render đúng view mà không reload trang.
7. Sau mỗi lần render route, `utils/seo.js` cập nhật title, description và canonical.
8. `state/authStore.js` khởi tạo auth từ `sessionStorage` và cập nhật header/account khi user đăng nhập hoặc đăng xuất.
9. `features/search.js`, `features/watchlist.js`, `features/history.js` xử lý tìm kiếm overlay, danh sách lưu và lịch sử xem.
10. `userLibraryRepository.js` quyết định watchlist/history dùng backend theo user hay localStorage fallback.
10. Khi deploy Vercel, `vercel.json` rewrite mọi request về `index.html`; app tự parse URL và render route đúng. Link demo hiện tại là `https://phimhay-tv.vercel.app/`.
11. Backend chạy riêng trong `server/`; khi chạy `npm run start` trong thư mục này, Express mount route `GET /api/health` tại `http://localhost:4000/api/health`.
12. Database dev chạy bằng `server/docker-compose.yml`; sau khi `npm run db:up`, Prisma dùng `DATABASE_URL` trong `server/.env` để migrate và seed dữ liệu mẫu.
13. API public đọc dữ liệu từ PostgreSQL qua `server/src/lib/prisma.js`, đi qua routes trong `server/src/routes/`, controllers trong `server/src/controllers/` và services trong `server/src/services/`.
15. Auth API dùng `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`; JWT được verify trong `authMiddleware.js` trước khi trả user hiện tại hoặc logout.
16. Frontend auth gọi các endpoint trên từ trang `/tai-khoan`, lưu JWT trong `sessionStorage` và không dùng mock user để giả đăng nhập.
17. Nếu backend local không chạy hoặc API trả lỗi, `movieRepository.js` tự dùng lại dữ liệu mock trong `src/data/movies.js` để giao diện vẫn hoạt động.

## Route URL hiện có

- `/`: Trang chủ.
- `/phim-le`: Danh sách phim lẻ.
- `/phim-bo`: Danh sách phim bộ.
- `/the-loai/:slug`: Danh sách phim theo thể loại.
- `/phim/:slug`: Chi tiết phim.
- `/xem/:slug/tap-:episode`: Player giả lập.
- `/tim-kiem?q=keyword`: Trang kết quả tìm kiếm.
- `/tai-khoan`: Trang tài khoản, đăng nhập, đăng ký, hồ sơ user và logout.
- URL sai sẽ render `notFoundView.js`.

## Phạm vi hiện tại

- Đây vẫn là frontend Vite, HTML/CSS/JavaScript thuần; backend chạy riêng trong `server/`.
- Đã có PostgreSQL local, migration đầu tiên và seed dữ liệu mẫu cho backend dev.
- Đã có API public đầu tiên cho phim, thể loại và tìm kiếm.
- Đã có Auth API cơ bản cho register, login, me, logout bằng JWT.
- Đã có middleware xác thực JWT và middleware kiểm tra quyền admin.
- Frontend đã nối API public cho danh sách phim, chi tiết phim, tập phim, search và tăng lượt xem; vẫn có fallback mock khi backend không khả dụng.
- Frontend đã nối Auth API cơ bản cho đăng nhập, đăng ký, `/api/auth/me` và logout.
- Frontend đã nối watchlist/history theo tài khoản qua `/api/me` khi đã đăng nhập, vẫn giữ localStorage fallback khi chưa đăng nhập hoặc backend lỗi.
- JWT frontend đang lưu bằng `sessionStorage`, không dùng `localStorage`.
- Đã có Admin Movie API backend cơ bản cho list/detail/create/update/delete mềm/publish/featured phim.
- Đã có Admin Episode API backend cơ bản cho list/detail/create/update/delete mềm/publish tập phim.
- Đã có frontend admin CRUD phim và tập phim trong `/admin`; chưa có CRUD thể loại, user hoặc bình luận/báo lỗi.
- Không đổi cấu trúc dữ liệu phim mẫu. Dữ liệu hiện được dùng chính qua export module, còn `window.MOVIES`/`window.USER` chỉ được expose tạm trong `src/main.js` để tương thích khi cần kiểm tra nhanh.
- Chưa tự động merge dữ liệu watchlist/history cũ trong `localStorage` lên backend sau khi đăng nhập.
