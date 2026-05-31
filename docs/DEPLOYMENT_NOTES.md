# Ghi chú deploy Vercel

Production Vercel hiện tại: https://phimhay-tv.vercel.app/

## Vì sao cần `vercel.json`

PhimHay TV đang dùng History API routing. Khi người dùng mở trực tiếp hoặc reload các URL như `/phim-le`, `/phim/bong-dem-sai-gon` hoặc `/xem/bong-dem-sai-gon/tap-1`, server production cần trả về `index.html` để JavaScript của app tự parse URL và render đúng view.

File `vercel.json` cấu hình rewrite toàn bộ request về `/index.html`, giúp SPA không bị 404 ở các route con trên Vercel.

## Route cần test sau deploy

- `/`
- `/phim-le`
- `/phim-bo`
- `/phim/bong-dem-sai-gon`
- `/xem/bong-dem-sai-gon/tap-1`
- `/tim-kiem?q=hanh%20dong`
- `/abc`

## Route đã test sau deploy

- https://phimhay-tv.vercel.app/
- https://phimhay-tv.vercel.app/phim-le
- https://phimhay-tv.vercel.app/phim-bo
- https://phimhay-tv.vercel.app/phim/bong-dem-sai-gon
- https://phimhay-tv.vercel.app/xem/bong-dem-sai-gon/tap-1
- https://phimhay-tv.vercel.app/tim-kiem?q=hanh%20dong
- https://phimhay-tv.vercel.app/abc

## Cách kiểm tra production

1. Mở trang chủ.
2. Mở trực tiếp `/phim-le`.
3. Mở trực tiếp `/phim/bong-dem-sai-gon`.
4. Mở trực tiếp `/xem/bong-dem-sai-gon/tap-1`.
5. Mở trực tiếp `/tim-kiem?q=hanh%20dong`.
6. Mở URL sai `/abc` và kiểm tra app tự render trang 404 nội bộ.

## Ghi chú

- Bước này chỉ chuẩn bị cấu hình deploy Vercel, chưa deploy thật.
- Không dùng GitHub Pages ở bước này để tránh phải xử lý `base: '/phimhay-tv/'`.
- Project vẫn là frontend mock, chưa có backend, database, admin hoặc đăng nhập thật.
