# Ghi chú admin shell local

## Mục tiêu

Bước này tạo khung admin an toàn và hiện đã có tab quản lý phim nối với Admin Movie API. Route frontend `/admin` vẫn dùng guard frontend, gọi backend endpoint `GET /api/admin/health` để kiểm tra quyền ADMIN thật trước khi render admin shell.

CRUD phim đã có ở frontend admin. CRUD tập phim, thể loại, người dùng, bình luận/báo lỗi hoặc dashboard thống kê thật chưa làm.

## Luồng admin

```txt
Login admin
→ Frontend /admin
→ adminGuard kiểm tra trạng thái auth frontend
→ adminApi.getAdminHealth()
→ Backend authMiddleware
→ Backend requireAdmin
→ Admin shell
```

Frontend guard chỉ phục vụ trải nghiệm người dùng. Quyền admin thật vẫn do backend kiểm tra bằng JWT qua `authMiddleware` và `requireAdmin`.

## Backend endpoint

```txt
GET /api/admin/health
```

Kết quả mong đợi:

- Không token: `401`.
- Token USER: `403`.
- Token ADMIN: `200`.
- Response thành công không trả `passwordHash` hoặc `password_hash`.

Response thành công:

```json
{
  "success": true,
  "message": "Khu vực admin hoạt động",
  "data": {
    "role": "ADMIN",
    "email": "admin@phimhay.local",
    "timestamp": "..."
  }
}
```

## Trường hợp bị chặn

### Chưa đăng nhập

Frontend `/admin` hiển thị thông báo:

```txt
Bạn cần đăng nhập bằng tài khoản admin để truy cập khu vực này.
```

Trang có nút về `/tai-khoan`.

### User thường

Nếu đăng nhập bằng `user@phimhay.local`, frontend `/admin` hiển thị trang 403:

```txt
Bạn không có quyền truy cập khu vực admin.
```

Admin shell không được render.

### Backend tắt

Nếu đang có token ADMIN nhưng backend local tắt, frontend `/admin` không fallback admin giả. Trang hiển thị lỗi:

```txt
Không kết nối được backend admin. Hãy chạy backend local.
```

API client có timeout request để trạng thái backend tắt không làm `/admin` treo ở màn chờ.

## Admin shell hiện tại

Admin shell hiện có:

- Tiêu đề `Quản trị PhimHay TV`.
- Thông tin admin hiện tại: displayName/email/role.
- Tab `Tổng quan`.
- Tab `Quản lý phim` có CRUD thật cho list/detail/create/update/publish/featured/delete mềm.
- Các nhóm chưa làm:
  - Quản lý tập phim
  - Quản lý thể loại
  - Quản lý người dùng
  - Quản lý bình luận/báo lỗi

Các nhóm ngoài phim vẫn bị khóa để giữ đúng phạm vi bước hiện tại.

## Việc làm sau

Backend hiện đã có Admin Movie API cơ bản cho list/detail/create/update/publish/featured/delete mềm phim tại `/api/admin/movies`, và frontend `/admin` đã nối UI CRUD phim qua `src/services/adminMovieApi.js` và `src/render/adminMovieView.js`.

CRUD UI cho tập phim, thể loại, người dùng, bình luận/báo lỗi và dashboard thống kê sẽ được phát triển ở các bước sau.
