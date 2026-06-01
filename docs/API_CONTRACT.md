# API contract PhimHay TV

Tài liệu này mô tả API contract dự kiến cho backend PhimHay TV. Đây chỉ là bản thiết kế, chưa triển khai server thật.

## A. Quy ước chung

Base URL local dự kiến:

```txt
http://localhost:4000/api
```

Response JSON thành công:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "request_id": "req_123"
  }
}
```

Response JSON lỗi:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ.",
    "details": []
  }
}
```

Pagination query dùng chung:

- `page`: trang hiện tại, mặc định `1`.
- `limit`: số item mỗi trang, mặc định `20`.
- `sort`: trường sắp xếp, ví dụ `created_at`, `view_count`, `release_year`.
- `order`: `asc` hoặc `desc`.

Search/filter query dùng chung:

- `q`: từ khóa.
- `type`: loại phim, ví dụ `movie`, `series`.
- `category`: slug thể loại.
- `country`: slug quốc gia.
- `year`: năm phát hành.
- `status`: trạng thái phim.

Auth:

- Cách auth sẽ chốt ở bước sau.
- Có thể dùng JWT Bearer token hoặc cookie session.
- API admin luôn cần auth và quyền admin.

## B. Public API

### 1. `GET /api/movies`

Mục tiêu: lấy danh sách phim.

Query:

- `page`
- `limit`
- `type`
- `category`
- `country`
- `year`
- `q`
- `sort`
- `order`

Response mẫu:

```json
{
  "success": true,
  "data": [
    {
      "id": "movie_1",
      "title": "Bóng Đêm Sài Gòn",
      "slug": "bong-dem-sai-gon",
      "poster_url": "https://example.com/poster.jpg",
      "backdrop_url": "https://example.com/backdrop.jpg",
      "release_year": 2024,
      "type": "series",
      "status": "ongoing",
      "quality": "4K",
      "view_count": 2400000,
      "average_rating": 4.6
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "total_pages": 6
  }
}
```

### 2. `GET /api/movies/:slug`

Mục tiêu: lấy chi tiết phim.

Response gồm movie, categories, country, actors, directors và episodes.

```json
{
  "success": true,
  "data": {
    "id": "movie_1",
    "title": "Bóng Đêm Sài Gòn",
    "slug": "bong-dem-sai-gon",
    "original_title": "Saigon After Dark",
    "description": "Một đặc vụ trẻ trở về Sài Gòn để điều tra...",
    "poster_url": "https://example.com/poster.jpg",
    "backdrop_url": "https://example.com/backdrop.jpg",
    "trailer_url": "https://example.com/trailer.mp4",
    "release_year": 2024,
    "duration": "10 tập x 45 phút",
    "type": "series",
    "status": "ongoing",
    "quality": "4K",
    "language": "Tiếng Việt",
    "age_rating": "T16",
    "view_count": 2400000,
    "average_rating": 4.6,
    "country": {
      "id": "country_vn",
      "name": "Việt Nam",
      "slug": "viet-nam"
    },
    "categories": [
      {
        "id": "cat_action",
        "name": "Hành động",
        "slug": "hanh-dong"
      }
    ],
    "actors": [
      {
        "id": "actor_1",
        "name": "Trần Minh",
        "slug": "tran-minh",
        "role_name": "Đặc vụ Hùng"
      }
    ],
    "directors": [
      {
        "id": "director_1",
        "name": "Nguyễn Văn An",
        "slug": "nguyen-van-an"
      }
    ],
    "episodes": [
      {
        "id": "episode_1",
        "episode_number": 1,
        "title": "Trở về",
        "slug": "tap-1",
        "thumbnail_url": "https://example.com/thumb.jpg",
        "duration": "45 phút"
      }
    ]
  }
}
```

### 3. `GET /api/movies/:slug/episodes`

Mục tiêu: lấy danh sách tập phim.

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "episode_1",
      "episode_number": 1,
      "title": "Trở về",
      "slug": "tap-1",
      "video_url": "https://example.com/video.mp4",
      "thumbnail_url": "https://example.com/thumb.jpg",
      "duration": "45 phút",
      "view_count": 120000
    }
  ]
}
```

### 4. `GET /api/categories`

Mục tiêu: lấy danh sách thể loại.

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "cat_action",
      "name": "Hành động",
      "slug": "hanh-dong",
      "description": "Các phim có nhịp nhanh, hành động và truy đuổi."
    }
  ]
}
```

### 5. `GET /api/categories/:slug/movies`

Mục tiêu: lấy phim theo thể loại.

Query hỗ trợ:

- `page`
- `limit`
- `sort`
- `order`

Response giống `GET /api/movies`, kèm thông tin category trong `meta`.

### 6. `GET /api/search?q=`

Mục tiêu: tìm kiếm phim.

Query:

- `q`
- `type`
- `category`
- `country`
- `year`

Response giống `GET /api/movies`.

### 7. `POST /api/movies/:id/view`

Mục tiêu: tăng lượt xem.

Body có thể để trống ở giai đoạn đầu.

Response:

```json
{
  "success": true,
  "data": {
    "movie_id": "movie_1",
    "view_count": 2400001
  }
}
```

## C. Auth API

### 1. `POST /api/auth/register`

Fields:

- `email`
- `password`
- `display_name`

Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_1",
      "email": "user@example.com",
      "display_name": "Người dùng mới",
      "role": "user"
    },
    "token": "jwt_or_session_token"
  }
}
```

### 2. `POST /api/auth/login`

Fields:

- `email`
- `password`

Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_1",
      "email": "user@example.com",
      "display_name": "Người dùng",
      "role": "user"
    },
    "token": "jwt_or_session_token"
  }
}
```

### 3. `POST /api/auth/logout`

Mục tiêu: đăng xuất user hiện tại.

Response:

```json
{
  "success": true,
  "data": {
    "message": "Đăng xuất thành công."
  }
}
```

### 4. `GET /api/me`

Mục tiêu: lấy thông tin user hiện tại.

## D. User API

### 1. `GET /api/me/watchlist`

Mục tiêu: lấy danh sách phim đã lưu của user.

### 2. `POST /api/me/watchlist/:movieId`

Mục tiêu: thêm phim vào watchlist.

### 3. `DELETE /api/me/watchlist/:movieId`

Mục tiêu: xóa phim khỏi watchlist.

### 4. `GET /api/me/history`

Mục tiêu: lấy lịch sử xem của user.

### 5. `POST /api/me/history`

Body:

- `movie_id`
- `episode_id`
- `progress_seconds`
- `duration_seconds`

### 6. `DELETE /api/me/history/:id`

Mục tiêu: xóa một lịch sử xem.

### 7. `POST /api/movies/:id/ratings`

Body:

- `score`: số nguyên từ 1 đến 5.

### 8. `POST /api/movies/:id/comments`

Body:

- `episode_id` nullable.
- `parent_id` nullable.
- `content`.

### 9. `POST /api/reports`

Body:

- `movie_id`
- `episode_id` nullable.
- `reason`
- `description`

## E. Admin API

Tất cả admin API cần auth và quyền admin.

### 1. `GET /api/admin/dashboard`

Mục tiêu: lấy thống kê tổng quan cho admin.

### 2. `GET /api/admin/movies`

Mục tiêu: lấy danh sách phim trong admin, gồm cả phim chưa publish.

### 3. `POST /api/admin/movies`

Mục tiêu: tạo phim mới.

### 4. `PUT /api/admin/movies/:id`

Mục tiêu: cập nhật phim.

### 5. `DELETE /api/admin/movies/:id`

Mục tiêu: xóa hoặc soft delete phim.

### 6. `GET /api/admin/episodes`

Mục tiêu: lấy danh sách tập phim.

### 7. `POST /api/admin/episodes`

Mục tiêu: thêm tập phim.

### 8. `PUT /api/admin/episodes/:id`

Mục tiêu: sửa tập phim.

### 9. `DELETE /api/admin/episodes/:id`

Mục tiêu: xóa hoặc ẩn tập phim.

### 10. `GET /api/admin/categories`

Mục tiêu: lấy danh sách thể loại trong admin.

### 11. `POST /api/admin/categories`

Mục tiêu: tạo thể loại.

### 12. `PUT /api/admin/categories/:id`

Mục tiêu: cập nhật thể loại.

### 13. `DELETE /api/admin/categories/:id`

Mục tiêu: xóa thể loại nếu không còn ràng buộc dữ liệu.

### 14. `GET /api/admin/users`

Mục tiêu: quản lý user.

### 15. `PATCH /api/admin/users/:id/status`

Mục tiêu: đổi trạng thái user.

### 16. `GET /api/admin/comments`

Mục tiêu: xem danh sách bình luận.

### 17. `PATCH /api/admin/comments/:id/status`

Mục tiêu: ẩn/hiện bình luận.

### 18. `GET /api/admin/reports`

Mục tiêu: xem báo cáo lỗi phim.

### 19. `PATCH /api/admin/reports/:id/status`

Mục tiêu: cập nhật trạng thái báo lỗi.

## F. Error code gợi ý

- `400 VALIDATION_ERROR`: dữ liệu không hợp lệ.
- `401 UNAUTHENTICATED`: chưa đăng nhập hoặc token không hợp lệ.
- `403 FORBIDDEN`: không đủ quyền.
- `404 NOT_FOUND`: không tìm thấy dữ liệu.
- `409 CONFLICT`: dữ liệu bị trùng hoặc xung đột.
- `500 SERVER_ERROR`: lỗi server.

## G. Ví dụ response JSON

### List movies

```json
{
  "success": true,
  "data": [
    {
      "id": "movie_1",
      "title": "Bóng Đêm Sài Gòn",
      "slug": "bong-dem-sai-gon",
      "poster_url": "https://example.com/poster.jpg",
      "release_year": 2024,
      "type": "series"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

### Movie detail

```json
{
  "success": true,
  "data": {
    "id": "movie_1",
    "title": "Bóng Đêm Sài Gòn",
    "slug": "bong-dem-sai-gon",
    "categories": [],
    "country": null,
    "actors": [],
    "episodes": []
  }
}
```

### Login success

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_1",
      "email": "user@example.com",
      "display_name": "Người dùng",
      "role": "user"
    },
    "token": "jwt_or_session_token"
  }
}
```

### Validation error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ.",
    "details": [
      {
        "field": "email",
        "message": "Email không đúng định dạng."
      }
    ]
  }
}
```

### Not found error

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Không tìm thấy phim."
  }
}
```
