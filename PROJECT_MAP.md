# PROJECT_MAP

## Cấu trúc hiện tại

```txt
phimhay-tv-base/
├─ index.html
├─ css/
│  └─ style.css
├─ src/
│  ├─ main.js
│  ├─ data/
│  │  └─ movies.js
│  ├─ state/
│  │  └─ store.js
│  ├─ router/
│  │  └─ router.js
│  ├─ utils/
│  │  ├─ dom.js
│  │  ├─ format.js
│  │  ├─ imageFallback.js
│  │  ├─ seo.js
│  │  ├─ slug.js
│  │  └─ storage.js
│  ├─ render/
│  │  ├─ layout.js
│  │  ├─ homeView.js
│  │  ├─ listingView.js
│  │  ├─ detailView.js
│  │  ├─ playerView.js
│  │  ├─ accountView.js
│  │  ├─ searchView.js
│  │  └─ notFoundView.js
│  └─ features/
│     ├─ search.js
│     ├─ watchlist.js
│     └─ history.js
├─ assets/
├─ docs/
│  ├─ UI_REDESIGN_NOTES.md
│  └─ ROUTING_SEO_NOTES.md
├─ BACKEND_PLAN.md
├─ TODO.md
├─ README.md
├─ package.json
└─ vite.config.mjs
```

## Vai trò từng phần

- `index.html`: Khung HTML chính, giữ header, footer, search overlay, vùng `<main id="app"></main>`, CSS hiện tại và script module `/src/main.js`.
- `css/style.css`: Toàn bộ giao diện hiện tại theo phong cách dark cinematic V1, dùng CSS variables và các nhóm style rõ ràng cho base, header, hero, movie card, listing, detail, player, search, account và responsive.
- `src/main.js`: Điểm khởi động app, import data/router/features, expose tạm các handler cần cho inline `onclick`, khởi tạo event và render ban đầu.
- `src/data/movies.js`: Dữ liệu mẫu phim và user mock, export qua `movies` và `user`.
- `src/state/store.js`: State runtime của app như page hiện tại, phim đang chọn, tập đang xem, tab chi tiết, tab account, từ khóa search, trạng thái 404 và bộ lọc listing.
- `src/router/router.js`: Router URL thật bằng History API. File này intercept link nội bộ, gọi `pushState`, parse path hiện tại, cập nhật state, render view tương ứng và cập nhật SEO meta.
- `src/utils/storage.js`: Helper đọc/ghi/xóa `localStorage` an toàn bằng JSON, trả default value nếu dữ liệu lỗi.
- `src/utils/dom.js`: Helper DOM như `qs`, `qsa`, `setHTML`, `onClick`, `createIcons`.
- `src/utils/format.js`: Helper format/escape như `escapeHTML`, `stars`, `typeLabel`, `formatYear`, `formatDuration`, `formatRating`, `formatViewCount`.
- `src/utils/imageFallback.js`: Tạo ảnh fallback nội bộ dạng SVG data URI và thuộc tính xử lý `onerror` cho poster/backdrop/avatar.
- `src/utils/seo.js`: Helper cập nhật `document.title`, meta description và canonical, đồng thời tránh tạo trùng thẻ canonical.
- `src/utils/slug.js`: Helper tạo slug tiếng Việt, tìm phim/thể loại theo slug và tạo URL chi tiết/player/thể loại.
- `src/render/layout.js`: Các phần render dùng chung như active nav, empty state, movie card, icon, lookup movie, mobile menu và player menu.
- `src/render/homeView.js`: Render trang chủ, hero, tiếp tục xem, top phim, phim mới và thể loại.
- `src/render/listingView.js`: Render trang danh sách phim, search/filter/sort trong listing.
- `src/render/detailView.js`: Render trang chi tiết phim, tab, tập phim, trailer, diễn viên, đánh giá và phim tương tự.
- `src/render/playerView.js`: Render player giả lập và danh sách tập liên quan.
- `src/render/accountView.js`: Render tài khoản mock, watchlist, history, gói dịch vụ, thiết bị và cài đặt.
- `src/render/searchView.js`: Render trang kết quả tìm kiếm theo query `q` trên URL.
- `src/render/notFoundView.js`: Render trang 404 đơn giản, hợp theme và có link quay về trang chủ.
- `src/features/search.js`: Logic search overlay và render kết quả tìm kiếm.
- `src/features/watchlist.js`: Logic thêm/xóa watchlist, lưu qua `localStorage`.
- `src/features/history.js`: Logic history xem phim, lưu qua `localStorage`.
- `docs/UI_REDESIGN_NOTES.md`: Ghi chú tiếng Việt về hướng thiết kế giao diện V1 và những điểm cần cải thiện ở bước sau.

## Luồng chạy hiện tại

1. Trình duyệt tải `index.html`.
2. `index.html` tải `css/style.css` và script module `/src/main.js`.
3. `src/main.js` import dữ liệu, router, state, features và helper chung.
4. Người dùng click link nội bộ như `/phim/:slug` hoặc `/xem/:slug/tap-1`.
5. `router/router.js` intercept event, gọi `history.pushState()`, parse path hiện tại, cập nhật state rồi render view tương ứng trong `src/render/`.
6. Khi bấm Back/Forward, listener `popstate` parse lại URL và render đúng view mà không reload trang.
7. Sau mỗi lần render route, `utils/seo.js` cập nhật title, description và canonical.
8. `features/search.js`, `features/watchlist.js`, `features/history.js` xử lý tìm kiếm overlay, danh sách lưu và lịch sử xem.
9. `utils/storage.js` lưu watchlist/history vào `localStorage` để reload không mất dữ liệu.

## Route URL hiện có

- `/`: Trang chủ.
- `/phim-le`: Danh sách phim lẻ.
- `/phim-bo`: Danh sách phim bộ.
- `/the-loai/:slug`: Danh sách phim theo thể loại.
- `/phim/:slug`: Chi tiết phim.
- `/xem/:slug/tap-:episode`: Player giả lập.
- `/tim-kiem?q=keyword`: Trang kết quả tìm kiếm.
- `/tai-khoan`: Trang tài khoản mock.
- URL sai sẽ render `notFoundView.js`.

## Phạm vi hiện tại

- Đây vẫn là frontend mock chạy bằng Vite, HTML/CSS/JavaScript thuần.
- Chưa có backend, API thật, database, admin hoặc đăng nhập thật.
- Không đổi cấu trúc dữ liệu phim mẫu. Dữ liệu hiện được dùng chính qua export module, còn `window.MOVIES`/`window.USER` chỉ được expose tạm trong `src/main.js` để tương thích khi cần kiểm tra nhanh.
- Chưa nên sửa lớn cấu trúc `src/data/movies.js`, watchlist/history trong `localStorage`, hoặc cách render view hiện tại nếu chưa sang bước backend/API.
