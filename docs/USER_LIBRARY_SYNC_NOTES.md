# Ghi chú đồng bộ watchlist và lịch sử xem

Bước này thêm đồng bộ danh sách yêu thích và lịch sử xem theo tài khoản người dùng đã đăng nhập. Backend production vẫn chưa deploy, nên frontend vẫn giữ localStorage fallback để demo và trải nghiệm local không bị hỏng.

## Luồng watchlist

```txt
Click yêu thích
→ src/features/watchlist.js
→ src/data/userLibraryRepository.js
→ nếu đã đăng nhập và có movie id backend thì gọi /api/me/watchlist
→ backend me routes
→ userWatchlist controller/service
→ Prisma Watchlist
→ PostgreSQL local
```

Nếu chưa đăng nhập, backend lỗi hoặc phim chỉ có dữ liệu mock không có id backend, repository dùng lại localStorage key `phimhay_watchlist`.

## Luồng history

```txt
Vào player /xem/:slug/tap-:number
→ src/features/history.js
→ src/data/userLibraryRepository.js
→ nếu đã đăng nhập và có movie id backend thì gọi /api/me/history
→ backend me routes
→ userHistory controller/service
→ Prisma WatchHistory
→ PostgreSQL local
```

Nếu chưa đăng nhập hoặc backend lỗi, repository dùng lại localStorage key `phimhay_history`.

## Backend endpoint mới

```txt
GET    /api/me/watchlist
POST   /api/me/watchlist/:movieId
DELETE /api/me/watchlist/:movieId

GET    /api/me/history
POST   /api/me/history
DELETE /api/me/history/:id
DELETE /api/me/history
```

Tất cả endpoint trên đều dùng `authMiddleware`, lọc theo `req.user.id` và không cho đọc/xóa dữ liệu của user khác.

## Giới hạn hiện tại

- Chưa tự động merge localStorage cũ lên backend sau khi đăng nhập.
- Chưa có UI riêng để chọn đồng bộ dữ liệu local cũ.
- Khi backend tắt, warning mạng là bình thường và app quay về localStorage fallback.
- JWT vẫn lưu trong `sessionStorage` theo thiết kế frontend auth hiện tại.
