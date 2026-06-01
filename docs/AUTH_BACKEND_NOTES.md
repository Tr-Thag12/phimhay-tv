# Ghi chú Auth backend

Auth backend hiện dùng JWT Bearer token cho các endpoint cơ bản:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Token được tạo bằng `jsonwebtoken`, secret lấy từ `JWT_SECRET`, thời hạn lấy từ `JWT_EXPIRES_IN`. Ở local dev, nếu thiếu `JWT_SECRET`, backend dùng secret fallback và log cảnh báo rõ. Ở production, thiếu `JWT_SECRET` sẽ báo lỗi.

## Trạng thái hiện tại

- Đã có đăng ký, đăng nhập, lấy thông tin người dùng hiện tại và logout stateless.
- Đã có validate request bằng `zod`.
- Đã hash password bằng `bcryptjs`.
- Đã có rate limit nhẹ cho register/login.
- Đã có middleware `authMiddleware` để xác thực JWT.
- Đã có middleware `requireAdmin` để chuẩn bị cho admin sau này.
- Chưa có refresh token.
- Chưa có blacklist token khi logout.
- Frontend đã nối đăng nhập/đăng ký/me/logout cơ bản tại `/tai-khoan`.
- Watchlist/history vẫn đang lưu bằng `localStorage`.

## User mẫu local dev

- Admin: `admin@phimhay.local` / `Admin@123456`
- User: `user@phimhay.local` / `User@123456`

Các mật khẩu mẫu chỉ dùng cho local dev và không dùng cho production.
