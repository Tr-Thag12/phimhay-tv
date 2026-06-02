# Ghi chú Admin Movie UI

## Mục tiêu

Bước này nối frontend admin với backend Admin Movie API để tài khoản ADMIN quản lý phim trực tiếp trong route `/admin`. Phạm vi chỉ gồm CRUD phim ở frontend admin, không làm CRUD tập phim, thể loại, user, bình luận/báo lỗi, không upload file thật và không đổi schema database.

## Luồng xử lý

```txt
ADMIN login
→ /admin
→ admin guard
→ GET /api/admin/health
→ admin movie UI
→ adminMovieApi
→ /api/admin/movies
→ backend admin movie API
→ Prisma
→ PostgreSQL
```

Frontend guard chỉ phục vụ trải nghiệm người dùng. Quyền thật vẫn do backend kiểm tra bằng JWT qua `authMiddleware` và `requireAdmin`. Nếu backend admin tắt hoặc token không đủ quyền, UI báo lỗi rõ và không fallback dữ liệu admin giả.

## File liên quan

- `src/services/adminMovieApi.js`: service gọi Admin Movie API với `auth: true`.
- `src/render/adminView.js`: render shell admin, tab `Tổng quan` và `Quản lý phim`.
- `src/render/adminMovieView.js`: render toàn bộ UI CRUD phim.
- `css/style.css`: style bảng, toolbar, phân trang, modal form/detail và responsive.

## Chức năng UI

- List: bảng phim admin có poster, tên phim, slug, loại, năm, quốc gia, thể loại, published, featured, lượt xem và thao tác.
- Search/filter: hỗ trợ `q`, `isPublished`, `type`, `status`, `sort` và `limit`.
- Pagination: hiển thị trang hiện tại, tổng trang, tổng số phim, nút trước/sau.
- Create: form thêm phim gọi `POST /api/admin/movies`.
- Update: form sửa phim gọi `PATCH /api/admin/movies/:id`.
- Detail: modal chi tiết gọi `GET /api/admin/movies/:id`, hiển thị metadata và episodes nếu API trả về.
- Publish: bật/tắt public bằng `PATCH /api/admin/movies/:id/publish`; khi tắt có confirm nhẹ.
- Featured: bật/tắt nổi bật bằng `PATCH /api/admin/movies/:id/featured`.
- Soft delete: nút xóa mềm bắt buộc confirm rồi gọi `DELETE /api/admin/movies/:id`.

## Giới hạn hiện tại

- Chưa upload file poster/backdrop/trailer thật, chỉ nhập URL.
- Chưa CRUD tập phim.
- Chưa CRUD thể loại.
- Chưa CRUD user.
- Chưa quản lý bình luận/báo lỗi.
- `countryId` hiện nhập thủ công từ dữ liệu list/detail; chưa có API country riêng cho admin.
- `categoryIds` nhập dạng danh sách id cách nhau bằng dấu phẩy.
- Delete là ẩn phim khỏi public, không hard delete:
  - `isPublished=false`
  - `isFeatured=false`
  - `status=HIDDEN`

## Kiểm thử chính

- Chưa đăng nhập vào `/admin` phải bị chặn.
- USER vào `/admin` phải thấy 403 và không thấy CRUD phim.
- ADMIN vào `/admin` thấy admin shell và tab `Quản lý phim`.
- Backend tắt khi ở `/admin` phải báo “Không kết nối được backend admin. Hãy chạy backend local.” và không crash.
- Public list/detail không còn hiển thị phim đã soft delete.
