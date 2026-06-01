# Nối frontend với API public

Tài liệu này ghi lại phần nối frontend PhimHay TV với API public của backend trong bước 12.

## Mục tiêu

- Frontend gọi backend local tại `http://localhost:4000/api`.
- Dữ liệu phim, thể loại, chi tiết phim, tập phim và tìm kiếm ưu tiên lấy từ API.
- Nếu backend tắt, lỗi mạng hoặc API trả lỗi, frontend tự fallback về dữ liệu mock trong `src/data/movies.js`.
- Không đổi giao diện, không đổi schema database, không thêm auth/admin.
- Watchlist và history vẫn dùng `localStorage`.

## Biến môi trường

File mẫu ở root project:

```txt
.env.example
```

Nội dung:

```txt
VITE_API_BASE_URL=http://localhost:4000/api
```

Khi cần đổi API base URL, tạo file `.env` ở root frontend và sửa `VITE_API_BASE_URL`.

## File frontend mới

- `src/services/apiClient.js`: cấu hình API base URL, gọi `fetch`, parse JSON response và chuẩn hóa lỗi.
- `src/services/movieApi.js`: gom các hàm gọi API public cho movies, categories, search và tăng lượt xem.
- `src/services/movieAdapter.js`: chuyển response backend sang format UI cũ đang dùng.
- `src/data/movieRepository.js`: lớp dữ liệu trung gian, gọi API trước và fallback về mock data khi API lỗi.

## Luồng dữ liệu hiện tại

1. `src/main.js` khởi tạo app và router.
2. `src/router/router.js` đọc URL hiện tại.
3. Router gọi `src/data/movieRepository.js` để tải dữ liệu theo route.
4. Repository gọi API qua `src/services/movieApi.js`.
5. Response backend được adapter chuyển về shape cũ cho các view.
6. Nếu API không dùng được, repository trả dữ liệu từ `src/data/movies.js`.
7. Các view trong `src/render/` render bằng dữ liệu đã nằm trong state/cache.

## API đang dùng

```txt
GET /api/movies
GET /api/movies/:slug
GET /api/movies/:slug/episodes
POST /api/movies/:slug/view
GET /api/categories
GET /api/categories/:slug/movies
GET /api/search?q=keyword
```

## Route frontend cần kiểm thử

Khi backend đang chạy:

- `/`
- `/phim-le`
- `/phim-bo`
- `/phim/bong-dem-sai-gon`
- `/xem/bong-dem-sai-gon/tap-1`
- `/tim-kiem?q=hanh%20dong`
- `/abc`

Khi backend đã dừng:

- Reload `/`
- Reload `/phim-le`
- Reload `/phim/bong-dem-sai-gon`
- Search hoặc mở `/tim-kiem?q=hanh%20dong`

Các route trên vẫn phải render được bằng dữ liệu mock.

## Cách kiểm tra API/mock

Frontend lưu nguồn dữ liệu hiện tại trong runtime state:

```js
window.state.dataSource
```

Giá trị mong đợi:

- `api`: backend local đang chạy, API trả response hợp lệ và frontend đang ưu tiên dữ liệu thật từ PostgreSQL.
- `mock`: backend tắt, lỗi mạng hoặc API trả lỗi; frontend đã fallback về `src/data/movies.js`.

Lỗi API gần nhất, nếu có, nằm ở:

```js
window.state.dataError
```

## Khi nào fallback xảy ra

Fallback xảy ra khi `src/data/movieRepository.js` không lấy được dữ liệu từ API public, ví dụ:

- Backend ở `http://localhost:4000` chưa chạy.
- Port 4000 bị chiếm bởi process khác.
- Database/PostgreSQL chưa sẵn sàng nên API lỗi.
- API trả response lỗi hoặc response không đúng format mong đợi.
- Mạng local từ browser tới backend bị từ chối.

Khi fallback xảy ra, browser có thể hiện warning như `ERR_CONNECTION_REFUSED` hoặc `Failed to fetch`. Đây là warning được phép trong lúc test fallback, miễn là app vẫn render và không crash.

## Cách test khi backend tắt

1. Chạy frontend bằng `npm run dev`.
2. Dừng backend bằng `Ctrl+C` ở terminal backend.
3. Reload các route:
   - `/`
   - `/phim-le`
   - `/phim/bong-dem-sai-gon`
   - `/tim-kiem?q=hanh%20dong`
4. Mở DevTools Console và kiểm tra:

```js
window.state.dataSource
```

Kết quả mong đợi là `mock`. Các trang vẫn phải render bằng dữ liệu mẫu trong `src/data/movies.js`.

## Ghi chú

- Frontend chưa lưu watchlist/history lên backend.
- Player chỉ gọi `POST /api/movies/:slug/view` theo kiểu best effort; nếu API lỗi thì giao diện xem phim vẫn chạy.
- Chưa nối auth, user API, admin API hoặc CRUD admin.
- Chưa deploy backend/database production.
