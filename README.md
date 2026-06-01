# PhimHay TV - Base Project

Đây là base project cho website xem phim PhimHay TV. Frontend đang chạy bằng Vite, HTML/CSS/JavaScript thuần. Backend hiện có Node.js + Express + Prisma trong thư mục `server/`, kèm PostgreSQL local bằng Docker Compose, migration đầu tiên, seed dữ liệu mẫu, API public cho phim/thể loại/tìm kiếm và Auth API cơ bản bằng JWT. Frontend hiện đã gọi API public trước và tự fallback về dữ liệu mock khi backend không khả dụng.

Demo Vercel: https://phimhay-tv.vercel.app/

Demo Vercel hiện là frontend đã deploy. Backend production chưa deploy, nên khi không có backend online, frontend vẫn cần fallback mock data để demo không bị hỏng.

```txt
phimhay-tv-base/
├─ index.html
├─ css/
│  └─ style.css
├─ src/
│  ├─ main.js
│  ├─ data/
│  ├─ services/
│  ├─ state/
│  ├─ router/
│  ├─ utils/
│  ├─ render/
│  └─ features/
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
│     ├─ lib/
│     ├─ services/
│     ├─ controllers/
│     ├─ routes/
│     ├─ middlewares/
│     └─ utils/
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
│  ├─ FRONTEND_API_INTEGRATION.md
│  ├─ FULLSTACK_LOCAL_GUIDE.md
│  └─ DEPLOYMENT_NOTES.md
├─ package.json
├─ vercel.json
└─ vite.config.mjs
```

## Chạy fullstack local

Xem hướng dẫn chi tiết tại [docs/FULLSTACK_LOCAL_GUIDE.md](docs/FULLSTACK_LOCAL_GUIDE.md).

Khi chạy đủ fullstack local, dùng 3 terminal:

1. Database:

```bash
cd server
npm run db:up
docker compose ps
```

2. Backend:

```bash
cd server
npm install
npx prisma migrate reset --force
npm run prisma:generate
npm run db:seed
npm run start
```

3. Frontend:

```bash
npm install
npm run dev
```

URL chính:

```txt
Frontend: http://localhost:5173
Backend health: http://localhost:4000/api/health
```

Lưu ý: `npx prisma migrate reset --force` chỉ nên dùng ở local vì sẽ xóa dữ liệu trong database dev rồi seed lại dữ liệu mẫu. Demo Vercel hiện chỉ là frontend; backend production chưa deploy.

## Chạy frontend riêng

Cài dependency:

```bash
npm install
```

Tạo file môi trường frontend nếu muốn đổi API base URL:

```bash
Copy-Item .env.example .env
```

Mặc định frontend gọi backend local tại:

```txt
http://localhost:4000/api
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

Đây là bản frontend đã deploy để xem giao diện, routing URL, search, watchlist/history bằng `localStorage` và player giả lập. Backend production chưa deploy, nên demo online vẫn dùng mock/fallback khi không có API public online.

## Backend skeleton

Backend skeleton nằm trong thư mục `server/` và chạy riêng với frontend.

```bash
cd server
npm install
npm run dev
```

Health check:

```txt
http://localhost:4000/api/health
```

API public backend hiện có:

```txt
GET /api/movies
GET /api/movies/:slug
GET /api/movies/:slug/episodes
POST /api/movies/:slug/view
GET /api/categories
GET /api/categories/:slug/movies
GET /api/search?q=keyword
```

Auth API backend hiện có:

```txt
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout
```

Auth dùng JWT Bearer token. Giao diện đăng nhập/đăng ký frontend chưa nối ở bước này.

Database local bằng Docker Compose:

```bash
cd server
Copy-Item .env.example .env
npm run db:up
npm run db:migrate -- --name init
npm run db:seed
```

Xem hướng dẫn chi tiết tại [server/README.md](server/README.md).

Frontend vẫn chạy ở root project bằng:

```bash
npm run dev
```

## Frontend nối API public

Frontend hiện gọi API public của backend qua biến môi trường:

```txt
VITE_API_BASE_URL=http://localhost:4000/api
```

Luồng dữ liệu chính:

- `src/services/apiClient.js` cấu hình base URL và xử lý response JSON.
- `src/services/movieApi.js` gom các hàm gọi `/movies`, `/categories`, `/search`.
- `src/services/movieAdapter.js` chuyển response backend về format UI cũ đang dùng.
- `src/data/movieRepository.js` ưu tiên đọc API, nếu backend tắt hoặc lỗi thì tự fallback về `src/data/movies.js`.
- Watchlist và history vẫn lưu bằng `localStorage`, chưa chuyển sang backend.

Khi muốn test đúng luồng API, chạy backend trước ở `http://localhost:4000`, sau đó chạy frontend ở `http://localhost:5173`.

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
- [Nối frontend với API public](docs/FRONTEND_API_INTEGRATION.md)
- [Chạy fullstack local](docs/FULLSTACK_LOCAL_GUIDE.md)
- [Ghi chú Auth backend](docs/AUTH_BACKEND_NOTES.md)
- [Backend skeleton](server/README.md)

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
- Frontend gọi API public cho phim, thể loại, chi tiết phim, tập phim, search và tăng lượt xem
- Fallback về dữ liệu mock nếu backend local không chạy
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

- Dữ liệu mẫu hiện nằm trong `src/data/movies.js` và vẫn được giữ làm fallback.
- Frontend gọi API qua `src/services/` và `src/data/movieRepository.js`.
- Luồng render chính bắt đầu từ `src/main.js`, qua `src/router/router.js`, đọc URL hiện tại rồi tới các file view trong `src/render/`.
- Search, watchlist và history nằm trong `src/features/`.
- Giao diện chính nằm trong `css/style.css`, dùng CSS variables và chia nhóm style theo base, header, hero, card phim, listing, detail, player, search, account và responsive.
- Backend hiện có health check, Docker Compose PostgreSQL local, Prisma migration đầu tiên, seed dữ liệu mẫu, API public và Auth API cơ bản trong `server/`. Frontend đã nối API public, nhưng chưa nối giao diện đăng nhập/đăng ký và chưa có admin CRUD.
