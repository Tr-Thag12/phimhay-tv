# Backend PhimHay TV

Đây là backend Node.js + Express + Prisma của PhimHay TV, đặt riêng trong thư mục `server/`. Hiện backend đã có PostgreSQL local bằng Docker Compose, Prisma migration đầu tiên, seed dữ liệu mẫu, API public cho phim/thể loại/tìm kiếm, Auth API cơ bản dùng JWT, Admin Movie API cho quản trị phim và Admin Episode API cho quản trị tập phim.

Frontend vẫn chạy riêng ở thư mục root project. Frontend đã gọi API public/Auth API, có admin shell và đã nối giao diện CRUD quản lý phim/tập phim với Admin API.

## Công nghệ

- Node.js
- Express
- Prisma
- PostgreSQL
- Docker Compose

## Cài đặt

Từ thư mục root project:

```bash
cd server
npm install
```

## Tạo env local

Sao chép file mẫu:

```bash
cp .env.example .env
```

Trên Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Giá trị dev mặc định:

```txt
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://phimhay:phimhay_password@localhost:5432/phimhay_tv?schema=public"
CLIENT_URL="http://localhost:5173"
JWT_SECRET="dev_change_me_to_a_long_random_secret"
JWT_EXPIRES_IN="7d"
```

Không commit file `.env` thật hoặc secret lên GitHub.

## Chạy PostgreSQL local

```bash
npm run db:up
```

Kiểm tra container:

```bash
docker compose ps
```

Xem log database:

```bash
npm run db:logs
```

Tắt database:

```bash
npm run db:down
```

## Prisma

Format schema:

```bash
npx prisma format
```

Chạy migration đầu tiên:

```bash
npm run db:migrate -- --name init
```

Hoặc:

```bash
npx prisma migrate dev --name init
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Seed dữ liệu mẫu:

```bash
npm run db:seed
```

Mở Prisma Studio:

```bash
npm run db:studio
```

## Chạy backend

Chạy dev:

```bash
npm run dev
```

Chạy bằng Node:

```bash
npm run start
```

Health check:

```txt
http://localhost:4000/api/health
```

Response thành công có dạng:

```json
{
  "success": true,
  "message": "Backend PhimHay TV đang hoạt động",
  "data": {
    "service": "phimhay-tv-api",
    "status": "ok",
    "timestamp": "..."
  }
}
```

## API public đầu tiên

Backend hiện có các API public để đọc dữ liệu phim, thể loại và tìm kiếm từ PostgreSQL thông qua Prisma:

- `GET /api/movies`: Lấy danh sách phim đã publish, có phân trang và bộ lọc.
- `GET /api/movies/:slug`: Lấy chi tiết phim theo slug.
- `GET /api/movies/:slug/episodes`: Lấy danh sách tập phim đã publish.
- `POST /api/movies/:slug/view`: Tăng lượt xem cho phim.
- `GET /api/categories`: Lấy danh sách thể loại.
- `GET /api/categories/:slug/movies`: Lấy phim theo thể loại.
- `GET /api/search?q=keyword`: Tìm kiếm phim đã publish.

Các API này chưa yêu cầu auth và chưa nối với frontend.

## Auth API

Backend đã có Auth API cơ bản dùng JWT Bearer token:

- `POST /api/auth/register`: Đăng ký tài khoản mới.
- `POST /api/auth/login`: Đăng nhập và nhận JWT.
- `GET /api/auth/me`: Lấy thông tin người dùng hiện tại, cần header `Authorization: Bearer <token>`.
- `POST /api/auth/logout`: Trả success cho logout stateless, cần header `Authorization: Bearer <token>`.

Response user chỉ trả dữ liệu an toàn: `id`, `email`, `displayName`, `avatarUrl`, `role`, `status`, `createdAt`, `updatedAt`. Backend không trả `passwordHash` hoặc `password_hash`.

Auth hiện chưa có refresh token, chưa có blacklist token khi logout và chưa nối với frontend. Watchlist/history vẫn đang dùng `localStorage` ở frontend.

Tài khoản mẫu local dev:

- `admin@phimhay.local` / `Admin@123456`
- `user@phimhay.local` / `User@123456`

Mật khẩu mẫu chỉ dùng cho local dev, không dùng cho production.

Test đăng ký:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:4000/api/auth/register" -ContentType "application/json" -Body '{"email":"testuser@phimhay.local","password":"Test@123456","displayName":"Test User"}'
```

Test đăng nhập:

```powershell
$login = Invoke-RestMethod -Method Post -Uri "http://localhost:4000/api/auth/login" -ContentType "application/json" -Body '{"email":"admin@phimhay.local","password":"Admin@123456"}'
$token = $login.data.token
```

Test `me`:

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:4000/api/auth/me" -Headers @{ Authorization = "Bearer $token" }
```

Test `logout`:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:4000/api/auth/logout" -Headers @{ Authorization = "Bearer $token" }
```

## Admin Movie API

Admin Movie API yêu cầu JWT Bearer token của tài khoản `ADMIN`. Tất cả endpoint đi qua `authMiddleware` và `requireAdmin`.

Endpoint hiện có:

- `GET /api/admin/movies`: Lấy danh sách phim cho admin, có phân trang và bộ lọc `page`, `limit`, `q`, `type`, `status`, `country`, `category`, `isPublished`, `sort`.
- `GET /api/admin/movies/:id`: Lấy chi tiết phim theo `id`, kèm country, categories, episodes và banners.
- `POST /api/admin/movies`: Tạo phim mới, validate bằng `zod`, kiểm tra slug/country/category.
- `PATCH /api/admin/movies/:id`: Cập nhật một phần thông tin phim, gồm categoryIds nếu cần thay đổi quan hệ thể loại.
- `PATCH /api/admin/movies/:id/publish`: Bật/tắt publish nhanh.
- `PATCH /api/admin/movies/:id/featured`: Bật/tắt nổi bật nhanh.
- `DELETE /api/admin/movies/:id`: Xóa mềm/ẩn phim, không hard delete.

Delete phim hiện là xóa mềm bằng cách đặt `isPublished=false`, `isFeatured=false`, `status=HIDDEN`. API chưa upload ảnh/video thật, chỉ nhận URL text cho `posterUrl`, `backdropUrl`, `trailerUrl`.

## Admin Episode API

Admin Episode API yêu cầu JWT Bearer token của tài khoản `ADMIN`. Tất cả endpoint đi qua `authMiddleware` và `requireAdmin`.

Endpoint hiện có:

- `GET /api/admin/episodes`: Lấy danh sách tập phim cho admin, có phân trang và bộ lọc `page`, `limit`, `q`, `movieId`, `status`, `isPublished`, `sort`.
- `GET /api/admin/episodes/:id`: Lấy chi tiết tập phim theo `id`, kèm thông tin movie cơ bản.
- `POST /api/admin/episodes`: Tạo tập phim mới, validate bằng `zod`, kiểm tra movie tồn tại và chống trùng `movieId + episodeNumber` hoặc `movieId + slug`.
- `PATCH /api/admin/episodes/:id`: Cập nhật một phần thông tin tập phim.
- `PATCH /api/admin/episodes/:id/publish`: Bật/tắt publish nhanh.
- `DELETE /api/admin/episodes/:id`: Xóa mềm/ẩn tập phim, không hard delete.

Delete tập phim hiện là xóa mềm bằng cách đặt `isPublished=false`, `status=HIDDEN`, `publishedAt=null`. API chưa upload video/thumbnail thật, chỉ nhận URL text cho `videoUrl` và `thumbnailUrl`.

## Ví dụ thao tác Admin API

Login admin lấy token:

```powershell
$login = Invoke-RestMethod -Method Post -Uri "http://localhost:4000/api/auth/login" -ContentType "application/json" -Body '{"email":"admin@phimhay.local","password":"Admin@123456"}'
$adminToken = $login.data.token
```

Lấy danh sách phim admin:

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:4000/api/admin/movies?page=1&limit=20&sort=newest" -Headers @{ Authorization = "Bearer $adminToken" }
```

Tạo phim:

```powershell
$body = @{
  title = "Phim Admin Test"
  slug = "phim-admin-test"
  description = "Phim tạo từ Admin Movie API local."
  type = "MOVIE"
  status = "DRAFT"
  releaseYear = 2026
  duration = 120
  quality = "HD"
  language = "Vietsub"
  isPublished = $true
  isFeatured = $false
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:4000/api/admin/movies" -ContentType "application/json" -Headers @{ Authorization = "Bearer $adminToken" } -Body $body
```

Cập nhật phim:

```powershell
Invoke-RestMethod -Method Patch -Uri "http://localhost:4000/api/admin/movies/<movieId>" -ContentType "application/json" -Headers @{ Authorization = "Bearer $adminToken" } -Body '{"title":"Phim Admin Test đã sửa","description":"Mô tả đã cập nhật."}'
```

Bật/tắt publish:

```powershell
Invoke-RestMethod -Method Patch -Uri "http://localhost:4000/api/admin/movies/<movieId>/publish" -ContentType "application/json" -Headers @{ Authorization = "Bearer $adminToken" } -Body '{"isPublished":false}'
```

Bật/tắt nổi bật:

```powershell
Invoke-RestMethod -Method Patch -Uri "http://localhost:4000/api/admin/movies/<movieId>/featured" -ContentType "application/json" -Headers @{ Authorization = "Bearer $adminToken" } -Body '{"isFeatured":true}'
```

Xóa mềm phim:

```powershell
Invoke-RestMethod -Method Delete -Uri "http://localhost:4000/api/admin/movies/<movieId>" -Headers @{ Authorization = "Bearer $adminToken" }
```

Lấy danh sách tập phim admin:

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:4000/api/admin/episodes?page=1&limit=20&sort=newest" -Headers @{ Authorization = "Bearer $adminToken" }
```

Tạo tập phim:

```powershell
$episodeBody = @{
  movieId = "<movieId>"
  episodeNumber = 1
  title = "Tập admin test"
  slug = "tap-admin-test"
  status = "DRAFT"
  isPublished = $false
  duration = 45
  videoUrl = "https://example.com/video.mp4"
  thumbnailUrl = "https://example.com/thumb.jpg"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:4000/api/admin/episodes" -ContentType "application/json" -Headers @{ Authorization = "Bearer $adminToken" } -Body $episodeBody
```

Bật/tắt publish tập phim:

```powershell
Invoke-RestMethod -Method Patch -Uri "http://localhost:4000/api/admin/episodes/<episodeId>/publish" -ContentType "application/json" -Headers @{ Authorization = "Bearer $adminToken" } -Body '{"isPublished":true}'
```

Xóa mềm tập phim:

```powershell
Invoke-RestMethod -Method Delete -Uri "http://localhost:4000/api/admin/episodes/<episodeId>" -Headers @{ Authorization = "Bearer $adminToken" }
```

## Lệnh test curl

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/movies
curl "http://localhost:4000/api/movies?page=1&limit=2"
curl http://localhost:4000/api/movies/bong-dem-sai-gon
curl http://localhost:4000/api/movies/bong-dem-sai-gon/episodes
curl -X POST http://localhost:4000/api/movies/bong-dem-sai-gon/view
curl http://localhost:4000/api/categories
curl http://localhost:4000/api/categories/hanh-dong/movies
curl "http://localhost:4000/api/search?q=hanh%20dong"
curl http://localhost:4000/api/movies/khong-ton-tai
```

## Dữ liệu seed

Seed hiện tạo dữ liệu mẫu cho:

- Countries: Việt Nam, Hàn Quốc, Nhật Bản, Mỹ, Trung Quốc.
- Categories: Hành động, Tình cảm, Kinh dị, Hài, Phiêu lưu, Tâm lý, Hoạt hình, Viễn tưởng.
- Users:
  - `admin@phimhay.local` / `Admin@123456` với role `ADMIN`.
  - `user@phimhay.local` / `User@123456` với role `USER`.
- Movies: ít nhất 5 phim mẫu, gồm `Bóng Đêm Sài Gòn`, phim bộ nhiều tập, phim lẻ, phim nổi bật và phim ẩn/chưa publish.
- Episodes: phim lẻ có tập 1, phim bộ có nhiều tập.
- Banners: 2 banner active gắn với phim nổi bật.
- Watchlist, watch history, rating, comment và report mẫu cho user mẫu.

Password user mẫu được hash bằng `bcryptjs` trước khi ghi vào cột `password_hash`. Mật khẩu mẫu chỉ dùng cho local dev.

## Ghi chú phạm vi

- Đã có PostgreSQL local bằng Docker Compose.
- Đã có Prisma migration đầu tiên.
- Đã có seed dữ liệu mẫu.
- Đã có API public đầu tiên cho movies, categories và search.
- Đã có Auth API cơ bản cho register, login, me, logout bằng JWT.
- Đã có middleware xác thực JWT và middleware kiểm tra quyền admin.
- Đã có Admin Movie API backend cơ bản cho list/detail/create/update/publish/featured/delete mềm phim.
- Chưa nối frontend CRUD quản lý phim với Admin Movie API.
- Chưa deploy backend hoặc database.
