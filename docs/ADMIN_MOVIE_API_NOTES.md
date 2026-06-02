# Ghi chú Admin Movie API

## Mục tiêu

Bước này bổ sung backend Admin Movie API cho PhimHay TV và hiện đã được frontend `/admin` nối vào giao diện quản lý phim. ADMIN có thể xem danh sách, tìm kiếm/lọc/phân trang, xem chi tiết, tạo, sửa, bật/tắt publish, bật/tắt featured và xóa mềm phim. Upload file thật chưa được làm; form frontend chỉ nhập URL poster/backdrop/trailer.

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

## Frontend đã nối UI CRUD phim

Frontend admin dùng các file:

- `src/services/adminMovieApi.js`: gọi Admin Movie API với `auth: true`.
- `src/render/adminView.js`: giữ admin guard, gọi `/api/admin/health`, hiển thị shell và tab `Quản lý phim`.
- `src/render/adminMovieView.js`: render toolbar, bảng, phân trang, form thêm/sửa, modal chi tiết, toggle publish/featured và xóa mềm.

Luồng UI:

```txt
ADMIN login
→ /admin
→ admin guard
→ GET /api/admin/health
→ admin movie UI
→ adminMovieApi
→ /api/admin/movies
→ adminMovieController/adminMovieService
→ Prisma
→ PostgreSQL
```

Nếu backend admin tắt hoặc API lỗi, UI admin báo lỗi rõ ràng và không fallback dữ liệu admin giả.

## Giới hạn hiện tại

- Frontend CRUD phim đã có trong `/admin`.
- Chưa có upload file thật; poster/backdrop/trailer vẫn nhập bằng URL.
- Chưa upload poster/backdrop/trailer thật, chỉ nhận URL.
- Chưa có CRUD tập phim, thể loại, user, bình luận/báo lỗi.
- Chưa thay đổi schema database.
- Chưa tạo migration mới.
- Chưa deploy backend.
- Public API cũ vẫn chỉ trả phim đã publish.
