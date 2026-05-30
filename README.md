# PhimHay TV - Base Project

Đây là base project front-end cho website xem phim. Mình đã tách giao diện thành cấu trúc dễ làm tiếp:

```txt
phimhay-tv-base/
├─ index.html
├─ css/
│  └─ style.css
├─ js/
│  ├─ data.js
│  └─ app.js
├─ assets/
│  └─ images/
├─ BACKEND_PLAN.md
├─ TODO.md
├─ PROJECT_MAP.md
├─ package.json
└─ vite.config.mjs
```

## Cách chạy

Cài dependency:

```bash
npm install
```

Chạy dev server bằng Vite:

```bash
npm run dev
```

Sau đó mở URL Vite hiển thị trong terminal, thường là:

```txt
http://localhost:5173
```

Build production:

```bash
npm run build
```

Preview bản build:

```bash
npm run preview
```

## Đã có sẵn

- Trang chủ
- Trang danh sách phim + bộ lọc
- Trang chi tiết phim + tab
- Trang xem phim/player giả lập
- Trang tài khoản
- Tìm kiếm overlay
- Lưu phim bằng localStorage
- Lịch sử xem bằng localStorage
- Responsive mobile/tablet/desktop

## Chỗ cần thay sau này

- Thay dữ liệu mẫu trong `js/data.js` bằng dữ liệu từ database/API.
- Thay ảnh URL online bằng ảnh upload của dự án.
- Nếu làm PHP/Laravel/Node, giữ `css/style.css` và chuyển các phần render trong `app.js` thành template/view tương ứng.
