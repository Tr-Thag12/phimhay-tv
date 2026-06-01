# Backend PhimHay TV

Đây là backend skeleton cho PhimHay TV, đặt riêng trong thư mục `server/`. Mục tiêu của bước này là tạo nền móng Node.js + Express + Prisma có thể chạy được và có endpoint health check, chưa tạo database thật và chưa nối frontend.

## Công nghệ

- Node.js
- Express
- Prisma
- PostgreSQL

## Cài đặt

Từ thư mục root project:

```bash
cd server
npm install
```

## Tạo env

Sao chép file mẫu:

```bash
cp .env.example .env
```

Trên Windows PowerShell có thể dùng:

```powershell
Copy-Item .env.example .env
```

File `.env.example` đang dùng giá trị mẫu:

```txt
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/phimhay_tv?schema=public"
CLIENT_URL="http://localhost:5173"
```

Không commit file `.env` thật hoặc secret lên GitHub.

## Chạy dev

```bash
npm run dev
```

## Chạy bằng Node

```bash
npm run start
```

## Health check

Khi server chạy, mở:

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

## Prisma

Schema nháp nằm ở:

```txt
server/prisma/schema.prisma
```

Các lệnh có sẵn:

```bash
npm run prisma:generate
npm run prisma:studio
```

Bước này chưa chạy migrate thật vì chưa có PostgreSQL/database thật.

## Ghi chú phạm vi

- Chưa có database thật.
- Chưa migrate.
- Chưa seed dữ liệu.
- Chưa có auth thật.
- Chưa có admin.
- Chưa nối frontend với backend.
- Chưa deploy backend.
