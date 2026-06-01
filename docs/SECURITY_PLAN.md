# Security plan cho backend PhimHay TV

Tài liệu này ghi lại các nguyên tắc bảo mật cần áp dụng khi triển khai backend thật. Bước này chưa code backend.

## Nguyên tắc tài khoản và mật khẩu

- Không lưu password plain text.
- Chỉ lưu `password_hash`.
- Hash password bằng thuật toán phù hợp như bcrypt hoặc argon2.
- Validate email trước khi tạo tài khoản.
- Validate password theo độ dài tối thiểu và độ phức tạp hợp lý.
- Không trả thông báo quá cụ thể khi login sai, ví dụ không nói rõ email có tồn tại hay không.

## Auth và phân quyền

- Cần phân quyền rõ giữa `user` và `admin`.
- Bảo vệ toàn bộ admin API bằng middleware auth và middleware kiểm tra quyền admin.
- API user như watchlist/history/rating/comment phải kiểm tra user hiện tại.
- Không tin `user_id` gửi từ client cho các API thuộc tài khoản hiện tại; backend phải lấy user từ token/session.
- Sẽ chọn JWT hoặc cookie session ở bước triển khai auth sau.

## Bảo vệ request

- Validate input bằng schema trước khi xử lý business logic.
- Không tin dữ liệu từ client.
- Chặn dữ liệu ngoài kiểu mong muốn, ví dụ rating ngoài khoảng 1 đến 5.
- Chuẩn hóa slug ở backend để tránh slug trùng hoặc ký tự không mong muốn.
- Giới hạn kích thước body request.
- Kiểm tra quyền trước khi sửa/xóa dữ liệu.

## Rate limit và chống abuse

- Rate limit login để giảm brute force.
- Rate limit register nếu mở public.
- Rate limit API report lỗi phim và comment.
- Có thể thêm giới hạn theo IP hoặc user id.

## CORS và security headers

- Cấu hình CORS chỉ cho phép frontend domain được phép gọi API.
- Không mở CORS wildcard cho production nếu API có auth.
- Nếu dùng Express, cân nhắc Helmet/security headers.
- Cấu hình cookie secure/httpOnly/sameSite nếu dùng cookie session.

## Token và session

- Không lưu token nhạy cảm bừa bãi.
- Nếu dùng JWT, cần thời hạn hết hạn hợp lý.
- Nếu dùng refresh token, cần lưu và thu hồi được refresh token.
- Nếu dùng cookie session, cookie phải có `httpOnly`, `secure` và `sameSite`.

## Log và lỗi

- Ghi log lỗi cơ bản ở backend.
- Không trả stack trace ra client ở production.
- Response lỗi nên có `code` rõ ràng nhưng không lộ thông tin nhạy cảm.
- Log các hành động admin quan trọng ở giai đoạn sau nếu cần audit.

## Dữ liệu và file media

- Không cho upload file tùy tiện nếu chưa có kiểm tra định dạng/kích thước.
- Nếu sau này có upload poster/video, cần kiểm tra MIME type, dung lượng và quyền truy cập.
- Link video lỗi cần có cơ chế report và kiểm duyệt.

## Checklist trước production

- Đã hash password.
- Đã validate input.
- Đã bảo vệ admin API.
- Đã cấu hình CORS.
- Đã có rate limit cho auth.
- Đã ẩn stack trace production.
- Đã có biến môi trường cho secret.
- Đã có backup database.
- Đã có log lỗi cơ bản.
