# Ghi chú routing URL và SEO cơ bản

## Danh sách route

- `/`: Trang chủ.
- `/phim-le`: Danh sách phim lẻ.
- `/phim-bo`: Danh sách phim bộ.
- `/the-loai/:slug`: Danh sách phim theo thể loại, ví dụ `/the-loai/hanh-dong`.
- `/phim/:slug`: Chi tiết phim, ví dụ `/phim/bong-dem-sai-gon`.
- `/xem/:slug/tap-:episode`: Player giả lập, ví dụ `/xem/bong-dem-sai-gon/tap-1`.
- `/tim-kiem?q=keyword`: Trang kết quả tìm kiếm.
- `/tai-khoan`: Tài khoản mock.
- Route không hợp lệ sẽ render trang 404 trong `src/render/notFoundView.js`.

## Cách slug hoạt động

- Helper nằm trong `src/utils/slug.js`.
- Slug được tạo bằng cách chuyển chữ thường, bỏ dấu tiếng Việt, đổi khoảng trắng thành dấu gạch ngang và bỏ ký tự đặc biệt.
- Nếu dữ liệu phim sau này có trường `slug` thì dùng `movie.slug`.
- Nếu chưa có `slug` thì tạo từ `title`, sau đó mới fallback sang `name` hoặc `originalTitle`.
- Slug chỉ dùng để định tuyến và tìm dữ liệu, không làm thay đổi cấu trúc `movies`.

## Cách router hoạt động

1. Link nội bộ dùng `<a href="...">`.
2. `src/router/router.js` bắt click link cùng origin.
3. Router gọi `history.pushState()` để đổi URL mà không reload.
4. Router parse `window.location.pathname` và query hiện tại.
5. State được cập nhật theo route.
6. View tương ứng trong `src/render/` được render vào `<main id="app"></main>`.
7. Khi Back/Forward, listener `popstate` parse lại URL và render lại view.

## Cách SEO meta hoạt động

- Helper nằm trong `src/utils/seo.js`.
- Mỗi route cập nhật `document.title`.
- Meta description được cập nhật theo trang hiện tại.
- Canonical được tạo hoặc cập nhật theo `window.location.origin + window.location.pathname`.
- Router không tạo nhiều thẻ canonical trùng nhau.
- Chưa thêm `noindex` vì đây là frontend mock và chưa có chiến lược SEO production.

## Lưu ý khi deploy

- Vite dev server và `vite preview` có thể mở trực tiếp các URL SPA như `/phim-le` hoặc `/phim/:slug`.
- Nếu deploy lên Vercel hoặc Netlify, cần cấu hình rewrite mọi route về `index.html`.
- Nếu deploy lên GitHub Pages, cần xử lý fallback cho History API, ví dụ dùng file `404.html` trỏ về app hoặc cấu hình phù hợp với base path.
- Khi có backend thật, nên để backend/API trả dữ liệu theo slug và có thể render meta phía server nếu cần SEO nâng cao.
