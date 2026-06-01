# Chạy fullstack local PhimHay TV

Tài liệu này mô tả quy trình chạy PhimHay TV ở máy local sau khi frontend đã nối với API public của backend.

## Tổng quan

PhimHay TV hiện gồm ba phần chính:

- Frontend Vite ở root project.
- Backend Node.js + Express + Prisma trong thư mục `server/`.
- PostgreSQL local chạy bằng Docker Compose.

Frontend có thể chạy độc lập nhờ dữ liệu mock trong `src/data/movies.js`. Khi backend local chạy ổn, frontend ưu tiên lấy dữ liệu từ API qua `VITE_API_BASE_URL`. Khi backend tắt, lỗi mạng hoặc API trả lỗi, frontend fallback về mock để giao diện vẫn render được.

## Yêu cầu môi trường

- Node.js 20 trở lên.
- npm.
- Docker Desktop.
- Git.
- GitHub CLI nếu cần tạo Pull Request.
- Trình duyệt Chrome hoặc Edge để kiểm thử giao diện.

## Chuẩn bị biến môi trường

Frontend có file mẫu ở root:

```bash
Copy-Item .env.example .env
```

Backend có file mẫu trong `server/`:

```bash
cd server
Copy-Item .env.example .env
```

Giá trị quan trọng:

```txt
VITE_API_BASE_URL=http://localhost:4000/api
DATABASE_URL=postgresql://phimhay:phimhay_password@localhost:5432/phimhay_tv?schema=public
CLIENT_URL=http://localhost:5173
```

## Chạy fullstack local bằng 3 terminal

### Terminal 1: Database

```bash
cd server
npm run db:up
docker compose ps
```

PostgreSQL cần ở trạng thái running/healthy trước khi chạy Prisma.

### Terminal 2: Backend

```bash
cd server
npm install
npx prisma migrate reset --force
npm run prisma:generate
npm run db:seed
npm run start
```

Lưu ý: `npx prisma migrate reset --force` sẽ xóa dữ liệu local hiện có rồi tạo lại schema và seed dữ liệu mẫu.

### Terminal 3: Frontend

```bash
npm install
npm run dev
```

Vite thường chạy tại:

```txt
http://localhost:5173
```

## URL cần mở

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:4000/api/health`
- API movies: `http://localhost:4000/api/movies`
- API categories: `http://localhost:4000/api/categories`

## Route frontend cần test

- `/`
- `/phim-le`
- `/phim-bo`
- `/phim/bong-dem-sai-gon`
- `/xem/bong-dem-sai-gon/tap-1`
- `/tim-kiem?q=hanh%20dong`
- `/abc`

Kết quả mong đợi:

- Trang chủ render được.
- Danh sách phim render được.
- Chi tiết phim render được.
- Player render được.
- Search render được.
- Route sai render trang không tìm thấy.
- Watchlist/history vẫn hoạt động bằng `localStorage`.

## Test API nhanh

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/movies
curl http://localhost:4000/api/movies/bong-dem-sai-gon
curl http://localhost:4000/api/categories
curl "http://localhost:4000/api/search?q=hanh%20dong"
```

Kết quả mong đợi:

- `/api/health` có `success: true`.
- `/api/movies` có danh sách phim.
- `/api/movies/bong-dem-sai-gon` có chi tiết phim và tập phim.
- `/api/categories` có danh sách thể loại.
- `/api/search?q=hanh%20dong` trả response hợp lệ và có kết quả theo seed hiện tại.

## Cách test fallback

1. Giữ frontend đang chạy.
2. Dừng backend ở terminal backend bằng `Ctrl+C`.
3. Reload các route:
   - `/`
   - `/phim-le`
   - `/phim/bong-dem-sai-gon`
   - `/tim-kiem?q=hanh%20dong`
4. App vẫn phải render bằng mock data.

Khi backend tắt, browser devtools có thể hiện warning mạng như `ERR_CONNECTION_REFUSED` hoặc `Failed to fetch`. Đây là hành vi được phép trong lúc test fallback, miễn là app không crash và vẫn render nội dung.

## Cách kiểm tra data source

Data source đang được lưu trong runtime state:

```js
window.state.dataSource
```

Khi backend chạy ổn, giá trị nên là:

```txt
api
```

Khi backend tắt hoặc API lỗi và frontend fallback về mock, giá trị nên là:

```txt
mock
```

Lỗi API gần nhất nếu có nằm ở:

```js
window.state.dataError
```

Nếu cần kiểm tra nhanh trong DevTools Console:

```js
window.state.dataSource
window.state.dataError
localStorage.getItem('phimhay_watchlist')
localStorage.getItem('phimhay_history')
```

## Lỗi thường gặp và cách xử lý

### Docker Desktop chưa mở

Triệu chứng: `npm run db:up` lỗi hoặc Docker không tìm thấy daemon.

Cách xử lý: mở Docker Desktop, chờ Docker sẵn sàng rồi chạy lại:

```bash
cd server
npm run db:up
```

### Port 4000 bị chiếm

Triệu chứng: backend không start được hoặc health check không đúng service.

Cách xử lý trên PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 4000 -State Listen
```

Dừng process đang chiếm port hoặc đổi `PORT` trong `server/.env`.

### Port 5173 bị chiếm

Triệu chứng: Vite tự đổi sang port khác hoặc frontend không mở được ở `5173`.

Cách xử lý: kiểm tra terminal Vite để lấy URL thật, hoặc dừng process đang chiếm port.

### PostgreSQL container chưa healthy

Triệu chứng: Prisma báo không kết nối được database.

Cách xử lý:

```bash
cd server
docker compose ps
docker compose logs postgres
```

Chờ container sẵn sàng rồi chạy lại Prisma.

### Prisma migrate reset làm mất dữ liệu local

`npx prisma migrate reset --force` xóa dữ liệu local và seed lại dữ liệu mẫu. Chỉ dùng lệnh này cho môi trường dev/local.

### Quên copy `.env.example` thành `.env` trong server

Triệu chứng: backend thiếu `DATABASE_URL` hoặc kết nối sai database.

Cách xử lý:

```bash
cd server
Copy-Item .env.example .env
```

Sau đó kiểm tra lại `DATABASE_URL`.

### Backend tắt làm frontend hiện warning mạng

Đây là hành vi bình thường khi test fallback. Frontend thử gọi API trước, gặp lỗi mạng rồi fallback về mock data.

### Demo Vercel vẫn dùng mock

Frontend demo tại `https://phimhay-tv.vercel.app/` hiện là frontend đã deploy. Backend production chưa deploy, nên demo online vẫn cần mock/fallback để hoạt động.

## Checklist trước khi code bước tiếp theo

- `npm run build` frontend thành công.
- Docker PostgreSQL chạy và healthy.
- Prisma migrate/reset chạy đúng ở local.
- Seed dữ liệu mẫu chạy thành công.
- Backend API trả dữ liệu ở các endpoint chính.
- Frontend dùng API khi backend chạy.
- Frontend fallback mock khi backend tắt.
- Watchlist/history vẫn hoạt động bằng `localStorage`.
- Không có console error nghiêm trọng khi backend chạy.
