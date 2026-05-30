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
│  │  └─ storage.js
│  ├─ render/
│  │  ├─ layout.js
│  │  ├─ homeView.js
│  │  ├─ listingView.js
│  │  ├─ detailView.js
│  │  ├─ playerView.js
│  │  └─ accountView.js
│  └─ features/
│     ├─ search.js
│     ├─ watchlist.js
│     └─ history.js
├─ assets/
├─ docs/
│  └─ UI_REDESIGN_NOTES.md
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
- `src/state/store.js`: State runtime của app như page hiện tại, phim đang chọn, tập đang xem, tab chi tiết, tab account và bộ lọc listing.
- `src/router/router.js`: Điều hướng nội bộ theo state, chưa dùng URL routing thật. File này gọi view tương ứng và xử lý các hàm `navigateTo...`, `playMovie`, `setDetailTab`, `setAccountTab`.
- `src/utils/storage.js`: Helper đọc/ghi/xóa `localStorage` an toàn bằng JSON, trả default value nếu dữ liệu lỗi.
- `src/utils/dom.js`: Helper DOM như `qs`, `qsa`, `setHTML`, `onClick`, `createIcons`.
- `src/utils/format.js`: Helper format/escape như `escapeHTML`, `stars`, `typeLabel`, `formatYear`, `formatDuration`, `formatRating`, `formatViewCount`.
- `src/utils/imageFallback.js`: Tạo ảnh fallback nội bộ dạng SVG data URI và thuộc tính xử lý `onerror` cho poster/backdrop/avatar.
- `src/render/layout.js`: Các phần render dùng chung như active nav, empty state, movie card, icon, lookup movie, mobile menu và player menu.
- `src/render/homeView.js`: Render trang chủ, hero, tiếp tục xem, top phim, phim mới và thể loại.
- `src/render/listingView.js`: Render trang danh sách phim, search/filter/sort trong listing.
- `src/render/detailView.js`: Render trang chi tiết phim, tab, tập phim, trailer, diễn viên, đánh giá và phim tương tự.
- `src/render/playerView.js`: Render player giả lập và danh sách tập liên quan.
- `src/render/accountView.js`: Render tài khoản mock, watchlist, history, gói dịch vụ, thiết bị và cài đặt.
- `src/features/search.js`: Logic search overlay và render kết quả tìm kiếm.
- `src/features/watchlist.js`: Logic thêm/xóa watchlist, lưu qua `localStorage`.
- `src/features/history.js`: Logic history xem phim, lưu qua `localStorage`.
- `docs/UI_REDESIGN_NOTES.md`: Ghi chú tiếng Việt về hướng thiết kế giao diện V1 và những điểm cần cải thiện ở bước sau.

## Luồng chạy mới

1. Trình duyệt tải `index.html`.
2. `index.html` tải `css/style.css` và script module `/src/main.js`.
3. `src/main.js` import dữ liệu, router, state, features và helper chung.
4. `router/router.js` đọc state rồi gọi view tương ứng trong `src/render/`.
5. Các view render HTML vào `<main id="app"></main>`.
6. `features/search.js`, `features/watchlist.js`, `features/history.js` xử lý hành vi tìm kiếm, danh sách lưu và lịch sử xem.
7. `utils/storage.js` lưu watchlist/history vào `localStorage` để reload không mất dữ liệu.

## Phạm vi hiện tại

- Đây vẫn là frontend mock chạy bằng Vite, HTML/CSS/JavaScript thuần.
- Chưa có backend, API thật, database, admin hoặc đăng nhập thật.
- Nhánh thiết kế giao diện V1 là `feature/ui-redesign-v1` và chưa merge vào `main`.
- Không đổi cấu trúc dữ liệu phim mẫu. Dữ liệu hiện được dùng chính qua export module, còn `window.MOVIES`/`window.USER` chỉ được expose tạm trong `src/main.js` để tương thích khi cần kiểm tra nhanh.
