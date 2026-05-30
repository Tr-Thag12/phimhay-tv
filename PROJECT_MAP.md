# PROJECT_MAP

## Vai trò từng file

- `index.html`: Khung HTML chính của website, khai báo font, CSS, thư viện icon Lucide, header, footer, search overlay và vùng render `<main id="app"></main>`.
- `css/style.css`: Toàn bộ style giao diện hiện tại, bao gồm layout, responsive, card phim, trang chi tiết, player giả lập, tài khoản và overlay tìm kiếm.
- `js/data.js`: Dữ liệu mẫu của phim và người dùng, được gắn vào `window.MOVIES` và `window.USER`.
- `js/app.js`: Logic render giao diện, điều hướng giữa các màn hình, lọc phim, chi tiết phim, player giả lập, tài khoản, search overlay, watchlist và history bằng `localStorage`.
- `assets/`: Thư mục dành cho asset tĩnh của dự án. Hiện dữ liệu mẫu vẫn chủ yếu dùng ảnh online.
- `README.md`: Hướng dẫn tổng quan và cách chạy project.
- `BACKEND_PLAN.md`: Ghi chú định hướng backend cho các bước sau.
- `TODO.md`: Danh sách việc cần làm tiếp theo.
- `package.json`: Khai báo project npm, script chạy Vite và dependency phát triển.
- `vite.config.mjs`: Cấu hình Vite tối thiểu để phục vụ và build project frontend tĩnh.
- `.gitignore`: Bỏ qua thư mục sinh ra khi cài package và build.

## Luồng chạy hiện tại

1. Trình duyệt tải `index.html`.
2. `index.html` tải `css/style.css` để áp dụng giao diện.
3. `index.html` tải `js/data.js` trước, tạo `window.MOVIES` và `window.USER`.
4. `index.html` tải `js/app.js` sau, dùng dữ liệu global từ `data.js` để render nội dung vào `<main id="app"></main>`.
5. Người dùng thao tác trên giao diện, `app.js` cập nhật state trong bộ nhớ và lưu watchlist/history vào `localStorage`.

## Chưa nên sửa ở bước này

- Không đổi cấu trúc dữ liệu `window.MOVIES` trong `js/data.js`.
- Không đổi tên class CSS hoặc chỉnh giao diện nếu chưa có yêu cầu riêng.
- Không refactor lớn `js/app.js` sang module, React hoặc framework khác.
- Không thêm backend, API thật, đăng nhập thật hoặc database.
- Không xóa dữ liệu mẫu, ảnh mẫu hoặc các màn hình hiện có.
