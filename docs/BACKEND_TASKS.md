# Danh sách task backend PhimHay TV

Tài liệu này chia task backend theo thứ tự triển khai. Bước này chỉ lập kế hoạch, chưa code backend thật.

## Giai đoạn 1: Backend skeleton

- Tạo thư mục `server`.
- Setup Express.
- Setup env.
- Setup Prisma.
- Setup PostgreSQL connection.
- Setup health check.
- Tạo cấu trúc thư mục controller/service/repository nếu dùng REST API.
- Tạo middleware xử lý lỗi chung.

## Giai đoạn 2: Database

- Tạo Prisma schema.
- Tạo migration.
- Seed categories.
- Seed countries.
- Seed movies.
- Seed episodes.
- Kiểm tra quan hệ.
- Kiểm tra unique constraint cho slug/email/watchlist.
- Kiểm tra dữ liệu seed có thể render được ở frontend.

## Giai đoạn 3: Public API

- `GET /api/movies`.
- `GET /api/movies/:slug`.
- `GET /api/movies/:slug/episodes`.
- `GET /api/categories`.
- `GET /api/categories/:slug/movies`.
- `GET /api/search`.
- `POST /api/movies/:id/view`.
- Chuẩn hóa response JSON thành công/lỗi.
- Thêm pagination và filter.

## Giai đoạn 4: Frontend connect API

- Tạo `apiClient`.
- Tạo `movieService`.
- Thay mock data bằng API public theo từng bước.
- Xử lý loading/error/empty.
- Giữ fallback dữ liệu mock trong lúc API chưa ổn định nếu cần.
- Kiểm tra reload route URL thật sau khi dữ liệu lấy từ API.

## Giai đoạn 5: Auth

- Register.
- Login.
- Logout.
- Me.
- Middleware auth.
- Middleware kiểm tra quyền admin.
- Hash password.
- Rate limit login.

## Giai đoạn 6: User features

- Watchlist theo tài khoản.
- History theo tài khoản.
- Rating.
- Comment.
- Report lỗi.
- Đồng bộ dữ liệu user giữa localStorage cũ và API thật nếu cần migration nhẹ.

## Giai đoạn 7: Admin

- Admin dashboard.
- CRUD movies.
- CRUD episodes.
- CRUD categories.
- Manage users.
- Manage comments/reports.
- Quản lý banner/slider.
- Quản lý phim nổi bật.

## Definition of Done gợi ý

- API có response format thống nhất.
- Có validation cho request quan trọng.
- Có xử lý lỗi rõ ràng.
- Build frontend vẫn thành công.
- Có seed data tối thiểu để frontend hoạt động.
- Có tài liệu cập nhật nếu endpoint hoặc schema thay đổi.
