# Backend Plan gợi ý

Khi muốn nâng cấp từ giao diện tĩnh sang dự án hoàn chỉnh, bạn có thể làm theo hướng này.

## Bảng database gợi ý

### users
- id
- name
- email
- password
- role
- avatar
- created_at
- updated_at

### movies
- id
- title
- original_title
- description
- poster
- backdrop
- trailer_url
- year
- type: movie / series / animation
- status
- country
- age_rating
- quality
- duration
- rating
- views
- director
- language
- subtitle
- created_at
- updated_at

### categories
- id
- name
- slug

### movie_categories
- movie_id
- category_id

### episodes
- id
- movie_id
- season
- episode_number
- title
- description
- video_url
- thumbnail
- duration

### watchlist
- id
- user_id
- movie_id
- created_at

### watch_history
- id
- user_id
- movie_id
- episode_id
- progress
- watched_at

### reviews
- id
- user_id
- movie_id
- rating
- comment
- created_at

## API route gợi ý

```txt
GET    /api/movies
GET    /api/movies/:id
GET    /api/movies/:id/episodes
GET    /api/search?q=
POST   /api/watchlist
DELETE /api/watchlist/:movieId
GET    /api/me/watchlist
GET    /api/me/history
POST   /api/reviews
```

## Thứ tự làm để dễ đạt điểm

1. Làm CRUD phim ở admin.
2. Làm hiển thị danh sách phim ngoài client.
3. Làm trang chi tiết phim.
4. Làm tìm kiếm/lọc phim.
5. Làm đăng nhập/đăng ký.
6. Làm lưu phim và lịch sử xem.
7. Làm đánh giá phim.
8. Hoàn thiện responsive và báo cáo.
