# Ghi chú Frontend auth

Frontend auth hiện nối trang `/tai-khoan` với Auth API backend local. Bước này chỉ làm đăng nhập, đăng ký, lấy user hiện tại và đăng xuất; chưa làm admin CRUD và chưa đồng bộ watchlist/history theo tài khoản.

## Luồng đăng nhập

```txt
Login form
→ authStore.login
→ authApi.login
→ apiClient
→ Backend /api/auth/login
→ token/user
→ sessionStorage + auth state
→ render lại header và trang tài khoản
```

JWT được lưu trong `sessionStorage` với key `phimhay_auth_token`. Không dùng `localStorage` để lưu JWT ở bước này.

## Luồng khôi phục phiên

```txt
App start
→ initAuth
→ đọc token trong sessionStorage
→ /api/auth/me
→ set user nếu token hợp lệ
→ clear token nếu token sai/hết hạn hoặc backend auth không kết nối được
```

Nếu backend auth tắt, trang tài khoản hiển thị lỗi tiếng Việt và app không crash. Các trang phim vẫn dùng fallback mock như trước.

## Luồng đăng xuất

```txt
Click logout
→ authStore.logout
→ /api/auth/logout nếu có token
→ clear sessionStorage
→ clear user
→ quay về form đăng nhập
```

Logout backend hiện là JWT stateless, nên frontend vẫn xóa token local kể cả khi API logout lỗi.

## File chính

- `src/services/authStorage.js`: đọc/ghi/xóa JWT trong `sessionStorage`.
- `src/services/authApi.js`: gọi `/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`.
- `src/state/authStore.js`: giữ `user`, `token`, trạng thái loading/error và phát sự kiện khi auth đổi.
- `src/services/apiClient.js`: hỗ trợ option `auth: true` để gắn `Authorization: Bearer <token>`.
- `src/render/accountView.js`: render form login/register, user profile và logout.

## Ghi chú bảo mật

- `sessionStorage` chỉ phù hợp cho bản local học tập ở bước này.
- Production nên cân nhắc httpOnly cookie, refresh token, CSP và chiến lược chống XSS kỹ hơn.
- Chưa có refresh token.
- Chưa có frontend route guard admin.
- Watchlist/history vẫn đang lưu bằng `localStorage`.
