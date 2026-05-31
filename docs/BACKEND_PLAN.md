# Kế hoạch backend PhimHay TV

Tài liệu này chỉ lập kế hoạch backend, chưa triển khai code backend.

## A. Stack backend đề xuất

Ưu tiên đề xuất: Node.js + Express + Prisma + PostgreSQL.

Lý do:

- Dễ nối với frontend JavaScript hiện tại.
- Express đủ nhẹ cho API REST cơ bản.
- Prisma quản lý schema và migration rõ ràng.
- PostgreSQL phù hợp project web có nhiều quan hệ dữ liệu như phim, tập phim, thể loại, người dùng, bình luận và lịch sử xem.

Hướng thay thế có thể cân nhắc: Laravel + MySQL nếu muốn hệ sinh thái PHP, admin panel và mô hình MVC rõ ràng.

## B. Database tables đề xuất

- `users`
- `roles`
- `movies`
- `episodes`
- `categories`
- `movie_categories`
- `countries`
- `actors`
- `movie_actors`
- `watch_history`
- `watchlist`
- `comments`
- `ratings`
- `reports`
- `banners`

## C. API endpoints đề xuất

### Public

- `GET /api/movies`
- `GET /api/movies/:slug`
- `GET /api/movies/:slug/episodes`
- `GET /api/categories`
- `GET /api/categories/:slug/movies`
- `GET /api/search?q=`
- `POST /api/movies/:id/view`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`

### User

- `GET /api/me/watchlist`
- `POST /api/me/watchlist/:movieId`
- `DELETE /api/me/watchlist/:movieId`
- `GET /api/me/history`
- `POST /api/me/history`
- `POST /api/movies/:id/rating`
- `POST /api/movies/:id/comments`

### Admin

- `GET /api/admin/dashboard`
- `GET /api/admin/movies`
- `POST /api/admin/movies`
- `PUT /api/admin/movies/:id`
- `DELETE /api/admin/movies/:id`
- `POST /api/admin/episodes`
- `PUT /api/admin/episodes/:id`
- `DELETE /api/admin/episodes/:id`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/status`
- `DELETE /api/admin/comments/:id`

## D. Luồng backend hoạt động

1. Frontend gọi API.
2. API kiểm tra request.
3. API truy vấn database.
4. API trả JSON.
5. Frontend render dữ liệu.
6. `localStorage` hiện tại sẽ dần thay bằng dữ liệu user thật.

## E. Thứ tự backend nên làm

1. Setup backend skeleton.
2. Tạo database schema.
3. Seed dữ liệu phim mẫu.
4. API danh sách phim.
5. API chi tiết phim.
6. API tìm kiếm/lọc phim.
7. Kết nối frontend với API.
8. Auth.
9. Admin CRUD.
10. User watchlist/history.
