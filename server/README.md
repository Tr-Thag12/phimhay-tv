# Backend PhimHay TV

Đây là backend Node.js + Express + Prisma của PhimHay TV, đặt riêng trong thư mục `server/`. Hiện backend đã có PostgreSQL local bằng Docker Compose, Prisma migration đầu tiên, seed dữ liệu mẫu và endpoint health check.

Frontend vẫn chạy riêng ở thư mục root project. Bước này chưa nối frontend với backend.

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
  - `admin@phimhay.local`
  - `user@phimhay.local`
- Movies: ít nhất 5 phim mẫu, gồm `Bóng Đêm Sài Gòn`, phim bộ nhiều tập, phim lẻ, phim nổi bật và phim ẩn/chưa publish.
- Episodes: phim lẻ có tập 1, phim bộ có nhiều tập.
- Banners: 2 banner active gắn với phim nổi bật.
- Watchlist, watch history, rating, comment và report mẫu cho user mẫu.

Auth chưa được triển khai, nên `password_hash` đang dùng placeholder `not_configured_yet`. Đây không phải password thật.

## Ghi chú phạm vi

- Đã có PostgreSQL local bằng Docker Compose.
- Đã có Prisma migration đầu tiên.
- Đã có seed dữ liệu mẫu.
- Đã có API public đầu tiên cho movies, categories và search.
- Chưa nối frontend với backend.
- Chưa có auth thật.
- Chưa có admin.
- Chưa deploy backend hoặc database.
