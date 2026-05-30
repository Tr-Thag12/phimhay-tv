# Ghi Chú Thiết Kế Giao Diện V1

## Mục tiêu

Giao diện V1 được thiết kế lại theo phong cách dark cinematic, phù hợp với website xem phim trực tuyến. Trọng tâm là làm trải nghiệm hiện đại hơn nhưng vẫn giữ nguyên chức năng mock hiện tại: trang chủ, danh sách phim, chi tiết phim, player giả lập, tìm kiếm, watchlist, history và tài khoản mock.

## Hướng thiết kế

- Nền tối sâu, có gradient và ánh màu nhẹ để tạo cảm giác điện ảnh.
- Màu nhấn chính là đỏ/cam, dùng cho nút xem phim, badge nổi bật, active menu và progress.
- Header dùng nền blur, fixed, logo rõ hơn và menu mobile gọn hơn.
- Hero trang chủ dùng backdrop lớn, overlay gradient để chữ dễ đọc và CTA nổi bật.
- Card phim bo góc, có shadow, hover nhẹ, overlay nút play/yêu thích và title không tràn layout.
- Trang chi tiết dùng backdrop lớn, poster nổi bật, thông tin chia khối rõ ràng.
- Player giả lập có nền đen sâu, control bar và khu vực chọn tập rõ hơn.
- Search overlay có input lớn, nền blur và grid kết quả gọn.
- Account/watchlist/history được làm sạch hơn, dễ đọc hơn.

## Responsive đã kiểm tra

- Mobile 375px.
- Tablet 768px.
- Tablet/desktop nhỏ 1024px.
- Desktop full width.

## Bước 3.1: Đánh bóng giao diện

- Thêm helper fallback ảnh nội bộ tại `src/utils/imageFallback.js`.
- Poster, backdrop, thumbnail tập phim, ảnh trailer, ảnh diễn viên, ảnh history và avatar account có xử lý `onerror` để không vỡ layout khi ảnh online lỗi.
- Empty state được làm rõ hơn bằng nền nhẹ, icon và chữ nổi bật.
- Bổ sung `decoding="async"` và `loading="lazy"` cho các ảnh không quan trọng phía dưới.
- Tinh chỉnh CSS cho ảnh fallback, card phim và trạng thái rỗng để thống nhất với giao diện dark cinematic.

## Giới hạn của bước này

- Chưa thêm backend, database, admin hoặc đăng nhập thật.
- Chưa thêm video player thật.
- Chưa đổi cấu trúc dữ liệu phim mẫu.
- Chưa thêm thư viện UI nặng.
- Chưa thay ảnh mẫu bằng asset tự quản lý của dự án.

## Nên cải thiện ở bước sau

- Tách CSS lớn thành nhiều file nếu dự án tiếp tục mở rộng.
- Bổ sung trạng thái loading/skeleton nếu sau này dùng API thật.
- Làm URL routing thật cho từng trang/phim khi bước backend hoặc SPA routing được yêu cầu.
- Kiểm tra thêm accessibility chi tiết bằng công cụ chuyên dụng.
