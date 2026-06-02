# Ghi chú Admin Episode UI

## Mục tiêu

Bước này nối frontend admin với backend Admin Episode API để tài khoản `ADMIN` quản lý tập phim trực tiếp trong route `/admin`. Phạm vi chỉ gồm CRUD tập phim ở frontend admin, không làm CRUD thể loại, user, bình luận/báo lỗi, không upload file thật và không đổi schema database.

## Luồng xử lý

```txt
ADMIN login
→ /admin
→ admin guard
→ GET /api/admin/health
→ tab Quản lý tập phim
→ adminEpisodeApi
→ /api/admin/episodes
→ backend admin episode API
→ Prisma
→ PostgreSQL
```

Frontend guard chỉ phục vụ trải nghiệm người dùng. Quyền thật vẫn do backend kiểm tra bằng JWT qua `authMiddleware` và `requireAdmin`. Nếu backend admin tắt hoặc token không đủ quyền, UI báo lỗi rõ và không fallback dữ liệu admin giả.

## File liên quan

- `src/services/adminEpisodeApi.js`: service gọi Admin Episode API với `auth: true`.
- `src/render/adminView.js`: render shell admin, tab `Tổng quan`, `Quản lý phim` và `Quản lý tập phim`.
- `src/render/adminEpisodeView.js`: render toàn bộ UI CRUD tập phim.
- `css/style.css`: tái sử dụng style admin movie cho bảng, toolbar, phân trang, modal form/detail và responsive.

## Chức năng UI

- List: bảng tập phim admin có phim, số tập, tiêu đề, slug, duration, published và thao tác.
- Search/filter: hỗ trợ `q`, `movieId`, `isPublished`, `status`, `sort` và `limit`.
- Pagination: hiển thị trang hiện tại, tổng trang, tổng số tập, nút trước/sau.
- Create: form thêm tập phim gọi `POST /api/admin/episodes`.
- Update: form sửa tập phim gọi `PATCH /api/admin/episodes/:id`.
- Detail: modal chi tiết gọi `GET /api/admin/episodes/:id`, hiển thị metadata movie, episode, URL thumbnail/video và thời gian publish.
- Publish: bật/tắt public bằng `PATCH /api/admin/episodes/:id/publish`; khi tắt có confirm nhẹ.
- Soft delete: nút xóa mềm bắt buộc confirm rồi gọi `DELETE /api/admin/episodes/:id`.

## Giới hạn hiện tại

- Chưa upload video/thumbnail thật, chỉ nhập URL.
- Chưa có field `description` hoặc `embedUrl` vì schema episode hiện tại chưa có.
- Delete là ẩn tập khỏi public, không hard delete:
  - `isPublished=false`
  - `status=HIDDEN`
  - `publishedAt=null`
- Chưa CRUD thể loại.
- Chưa CRUD user.
- Chưa quản lý bình luận/báo lỗi.

## Kiểm thử chính

- Chưa đăng nhập vào `/admin` phải bị chặn.
- USER vào `/admin` phải thấy 403 và không thấy CRUD tập phim.
- ADMIN vào `/admin` thấy admin shell và tab `Quản lý tập phim`.
- Admin có thể list/filter/create/update/toggle publish/delete mềm tập phim.
- Backend tắt khi ở `/admin` phải báo lỗi backend admin và không crash.
- Public `/api/movies/:slug/episodes` không còn hiển thị tập đã soft delete.
