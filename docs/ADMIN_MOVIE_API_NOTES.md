# Ghi chú Admin Movie API

## Mục tiêu

Bước này bổ sung backend Admin Movie API cho PhimHay TV để chuẩn bị cho màn quản lý phim ở các bước sau. Phạm vi chỉ gồm API backend, validation, service/controller/routes và tài liệu. Frontend admin CRUD, form quản lý phim và upload file thật chưa được làm trong bước này.

## Route cần ADMIN

Tất cả route dưới đây nằm sau `authMiddleware` và `requireAdmin`:

```txt
GET /api/admin/movies
GET /api/admin/movies/:id
POST /api/admin/movies
PATCH /api/admin/movies/:id
DELETE /api/admin/movies/:id
PATCH /api/admin/movies/:id/publish
PATCH /api/admin/movies/:id/featured
```

`GET /api/admin/movies` hỗ trợ query:

```txt
page
limit
q
type
status
country
category
isPublished
sort=newest|oldest|popular|title
```

## Luồng xử lý

```txt
admin login
→ token
→ /api/admin/movies
→ authMiddleware
→ requireAdmin
→ adminMovieController
→ adminMovieService
→ Prisma
→ PostgreSQL
```

## Validation

Validation nằm ở `server/src/validators/adminMovie.validator.js` và dùng `zod`.

- `title` bắt buộc khi tạo phim.
- `slug` có thể gửi lên hoặc tự sinh từ `title`.
- `type` dùng enum Prisma `MovieType`: `MOVIE`, `SERIES`.
- `status` dùng enum Prisma `MovieStatus`: `DRAFT`, `PUBLISHED`, `HIDDEN`.
- `releaseYear` hợp lệ trong khoảng 1900-2100.
- `duration` hoặc `durationMinutes` được map về field thật `durationMinutes`.
- `countryId` nếu gửi lên phải tồn tại.
- `categoryIds` nếu gửi lên phải tồn tại đầy đủ.
- `posterUrl`, `backdropUrl`, `trailerUrl` chỉ nhận chuỗi URL hoặc chuỗi dev placeholder, chưa upload file thật.

## Delete mềm

`DELETE /api/admin/movies/:id` không hard delete. Endpoint này ẩn phim bằng cách:

- `isPublished=false`
- `isFeatured=false`
- `status=HIDDEN`

Cách này tránh xóa dữ liệu thật khi phim đã có quan hệ với tập phim, watchlist, lịch sử xem, rating, comment, report hoặc banner.

## Giới hạn hiện tại

- Chưa làm frontend CRUD admin.
- Chưa làm form quản lý phim trên `/admin`.
- Chưa upload poster/backdrop/trailer thật, chỉ nhận URL.
- Chưa thay đổi schema database.
- Chưa tạo migration mới.
- Chưa deploy backend.
- Public API cũ vẫn chỉ trả phim đã publish.

CRUD UI sẽ được làm ở bước sau.
