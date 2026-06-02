# Ghi chú Admin Episode API

## Mục tiêu

Bước này bổ sung backend Admin Episode API cho PhimHay TV để tài khoản `ADMIN` quản lý tập phim theo movie đã có. Phạm vi gồm list/detail/create/update, bật/tắt publish và xóa mềm tập phim. Không thêm upload file thật, không đổi schema database và không tạo migration mới.

## Route cần ADMIN

Tất cả route dưới đây nằm sau `authMiddleware` và `requireAdmin`:

```txt
GET /api/admin/episodes
GET /api/admin/episodes/:id
POST /api/admin/episodes
PATCH /api/admin/episodes/:id
DELETE /api/admin/episodes/:id
PATCH /api/admin/episodes/:id/publish
```

`GET /api/admin/episodes` hỗ trợ query:

```txt
page
limit
q
movieId
status
isPublished
sort=newest|oldest|episodeNumber
```

## Luồng xử lý

```txt
admin login
→ token
→ /api/admin/episodes
→ authMiddleware
→ requireAdmin
→ adminEpisodeController
→ adminEpisodeService
→ Prisma Episode/Movie
→ PostgreSQL
```

## Validation

Validation nằm ở `server/src/validators/adminEpisode.validator.js` và dùng `zod`.

- `movieId`, `title`, `episodeNumber` bắt buộc khi tạo tập phim.
- `slug` có thể gửi lên hoặc tự sinh từ `title`; nếu thiếu slug và title không tạo được slug thì fallback `tap-<episodeNumber>`.
- `episodeNumber` là số nguyên dương.
- `duration` hoặc `durationMinutes` được map về field thật `durationMinutes`.
- `status` dùng enum Prisma `EpisodeStatus`: `DRAFT`, `PUBLISHED`, `HIDDEN`.
- `isPublished` đồng bộ với `status` và `publishedAt` khi tạo hoặc toggle publish.
- `videoUrl`, `thumbnailUrl` chỉ nhận URL text hoặc chuỗi dev placeholder; chưa upload file thật.

## Ràng buộc dữ liệu

Service kiểm tra các ràng buộc chính trước khi ghi database:

- Movie theo `movieId` phải tồn tại.
- Không cho trùng `episodeNumber` trong cùng một movie.
- Không cho trùng `slug` trong cùng một movie.
- Nếu cập nhật `movieId`, `episodeNumber` hoặc `slug`, API kiểm tra lại trùng lặp theo movie mới.

## Delete mềm

`DELETE /api/admin/episodes/:id` không hard delete. Endpoint này ẩn tập phim bằng cách:

- `isPublished=false`
- `status=HIDDEN`
- `publishedAt=null`

Cách này giữ lại dữ liệu tập phim cho watch history, comment, report hoặc các quan hệ khác. Public API `GET /api/movies/:slug/episodes` chỉ trả tập đã publish, nên tập bị xóa mềm không xuất hiện ngoài public.

## Frontend đã nối UI CRUD tập phim

Frontend admin dùng các file:

- `src/services/adminEpisodeApi.js`: gọi Admin Episode API với `auth: true`.
- `src/render/adminView.js`: hiển thị tab `Quản lý tập phim` trong admin shell.
- `src/render/adminEpisodeView.js`: render toolbar, bảng, phân trang, form thêm/sửa, modal chi tiết, toggle publish và xóa mềm.

Nếu backend admin tắt hoặc API lỗi, UI admin báo lỗi rõ ràng và không fallback dữ liệu admin giả.

## Giới hạn hiện tại

- Chưa upload video/thumbnail thật, chỉ nhập URL.
- Chưa có field `description` hoặc `embedUrl` trong schema episode hiện tại.
- Chưa hard delete tập phim.
- Chưa CRUD thể loại, user, bình luận hoặc báo lỗi.
- Chưa thay đổi schema database.
- Chưa tạo migration mới.
- Chưa deploy backend.
