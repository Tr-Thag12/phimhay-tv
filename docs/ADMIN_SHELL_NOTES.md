# Ghi chú admin shell local

## Mục tiêu

Bước này tạo khung admin an toàn trước khi phát triển CRUD. Phạm vi chỉ gồm route frontend `/admin`, guard frontend, admin shell cơ bản và backend endpoint `GET /api/admin/health` để kiểm tra quyền ADMIN thật.

Chưa có CRUD phim, tập phim, thể loại, người dùng, bình luận hoặc dashboard thống kê thật.

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

Admin shell chỉ có:

- Tiêu đề `Quản trị PhimHay TV`.
- Thông tin admin hiện tại: displayName/email/role.
- Các card placeholder:
  - Quản lý phim
  - Quản lý tập phim
  - Quản lý thể loại
  - Quản lý người dùng
  - Quản lý bình luận/báo lỗi

Các card này bị khóa và chưa dẫn tới CRUD thật.

## Việc làm sau

Backend hiện đã có Admin Movie API cơ bản cho list/detail/create/update/publish/featured/delete mềm phim tại `/api/admin/movies`. Tuy nhiên các card trong admin shell vẫn chỉ là placeholder, chưa có CRUD UI.

CRUD UI cho phim, tập phim, thể loại, người dùng, bình luận/báo lỗi và dashboard thống kê sẽ được phát triển ở các bước sau.
