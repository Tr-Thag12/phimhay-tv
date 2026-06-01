# Backend PhimHay TV

Đây là backend Node.js + Express + Prisma của PhimHay TV, đặt riêng trong thư mục `server/`. Hiện backend đã có PostgreSQL local bằng Docker Compose, Prisma migration đầu tiên, seed dữ liệu mẫu, API public cho phim/thể loại/tìm kiếm và Auth API cơ bản dùng JWT.

Frontend vẫn chạy riêng ở thư mục root project. Frontend đã gọi API public, nhưng chưa nối giao diện đăng nhập/đăng ký với Auth API.

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
- Chưa nối frontend với Auth API.
- Chưa có admin.
- Chưa deploy backend hoặc database.
