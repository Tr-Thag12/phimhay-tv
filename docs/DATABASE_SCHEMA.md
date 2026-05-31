# Thiết kế database schema PhimHay TV

Tài liệu này mô tả schema database dự kiến cho backend PhimHay TV. Đây chỉ là bản phân tích, chưa tạo database thật và chưa tạo file `schema.prisma`.

## A. Mục tiêu database

Database cần phục vụ các nhóm dữ liệu chính:

- Lưu phim.
- Lưu tập phim.
- Lưu thể loại.
- Lưu quốc gia.
- Lưu diễn viên/đạo diễn.
- Lưu tài khoản user/admin.
- Lưu watchlist.
- Lưu lịch sử xem.
- Lưu bình luận.
- Lưu đánh giá.
- Lưu báo lỗi phim.
- Lưu banner/slider.
- Lưu thống kê lượt xem.

## B. Danh sách bảng chi tiết

### 1. `users`

| Cột | Kiểu gợi ý | Ghi chú |
| --- | --- | --- |
| `id` | UUID hoặc bigserial | Khóa chính. |
| `email` | varchar | Email đăng nhập, unique. |
| `password_hash` | varchar | Mật khẩu đã hash, không lưu plain text. |
| `display_name` | varchar | Tên hiển thị. |
| `avatar_url` | text | Ảnh đại diện. |
| `role` | varchar hoặc FK | `user`, `admin`, có thể tách sang bảng `roles`. |
| `status` | varchar | `active`, `blocked`, `pending`. |
| `created_at` | timestamp | Thời điểm tạo. |
| `updated_at` | timestamp | Thời điểm cập nhật. |

### 2. `roles`

| Cột | Kiểu gợi ý | Ghi chú |
| --- | --- | --- |
| `id` | UUID hoặc bigserial | Khóa chính. |
| `name` | varchar | Tên role, ví dụ `user`, `admin`. |
| `description` | text | Mô tả quyền. |

### 3. `movies`

| Cột | Kiểu gợi ý | Ghi chú |
| --- | --- | --- |
| `id` | UUID hoặc bigserial | Khóa chính. |
| `title` | varchar | Tên phim. |
| `slug` | varchar | Slug unique để routing. |
| `original_title` | varchar | Tên gốc. |
| `description` | text | Mô tả phim. |
| `poster_url` | text | Poster. |
| `backdrop_url` | text | Ảnh nền. |
| `trailer_url` | text | Trailer. |
| `release_year` | integer | Năm phát hành. |
| `duration` | varchar | Thời lượng hiển thị, ví dụ `120 phút`. |
| `total_episodes` | integer | Tổng số tập. |
| `type` | varchar | `movie`, `series`, `animation`. |
| `status` | varchar | `ongoing`, `completed`, `coming_soon`. |
| `quality` | varchar | `HD`, `Full HD`, `4K`. |
| `language` | varchar | Ngôn ngữ. |
| `country_id` | FK | Quốc gia. |
| `age_rating` | varchar | T13, T16, T18. |
| `view_count` | bigint | Lượt xem phim. |
| `average_rating` | decimal | Điểm trung bình. |
| `is_featured` | boolean | Phim nổi bật. |
| `is_published` | boolean | Có hiển thị public không. |
| `created_at` | timestamp | Thời điểm tạo. |
| `updated_at` | timestamp | Thời điểm cập nhật. |

### 4. `episodes`

| Cột | Kiểu gợi ý | Ghi chú |
| --- | --- | --- |
| `id` | UUID hoặc bigserial | Khóa chính. |
| `movie_id` | FK | Phim chứa tập này. |
| `episode_number` | integer | Số tập. |
| `title` | varchar | Tên tập. |
| `slug` | varchar | Slug tập nếu cần. |
| `video_url` | text | Link video. |
| `thumbnail_url` | text | Ảnh thumbnail. |
| `duration` | varchar | Thời lượng hiển thị. |
| `view_count` | bigint | Lượt xem tập. |
| `is_published` | boolean | Có hiển thị public không. |
| `created_at` | timestamp | Thời điểm tạo. |
| `updated_at` | timestamp | Thời điểm cập nhật. |

### 5. `categories`

| Cột | Kiểu gợi ý | Ghi chú |
| --- | --- | --- |
| `id` | UUID hoặc bigserial | Khóa chính. |
| `name` | varchar | Tên thể loại. |
| `slug` | varchar | Slug unique. |
| `description` | text | Mô tả. |
| `created_at` | timestamp | Thời điểm tạo. |
| `updated_at` | timestamp | Thời điểm cập nhật. |

### 6. `movie_categories`

| Cột | Kiểu gợi ý | Ghi chú |
| --- | --- | --- |
| `movie_id` | FK | Khóa ngoại tới `movies`. |
| `category_id` | FK | Khóa ngoại tới `categories`. |

### 7. `countries`

| Cột | Kiểu gợi ý | Ghi chú |
| --- | --- | --- |
| `id` | UUID hoặc bigserial | Khóa chính. |
| `name` | varchar | Tên quốc gia. |
| `slug` | varchar | Slug unique. |

### 8. `actors`

| Cột | Kiểu gợi ý | Ghi chú |
| --- | --- | --- |
| `id` | UUID hoặc bigserial | Khóa chính. |
| `name` | varchar | Tên diễn viên. |
| `slug` | varchar | Slug unique. |
| `avatar_url` | text | Ảnh đại diện. |
| `bio` | text | Tiểu sử ngắn. |

### 9. `movie_actors`

| Cột | Kiểu gợi ý | Ghi chú |
| --- | --- | --- |
| `movie_id` | FK | Khóa ngoại tới `movies`. |
| `actor_id` | FK | Khóa ngoại tới `actors`. |
| `role_name` | varchar | Tên vai diễn. |

### 10. `directors`

| Cột | Kiểu gợi ý | Ghi chú |
| --- | --- | --- |
| `id` | UUID hoặc bigserial | Khóa chính. |
| `name` | varchar | Tên đạo diễn. |
| `slug` | varchar | Slug unique. |
| `avatar_url` | text | Ảnh đại diện. |
| `bio` | text | Tiểu sử ngắn. |

### 11. `movie_directors`

| Cột | Kiểu gợi ý | Ghi chú |
| --- | --- | --- |
| `movie_id` | FK | Khóa ngoại tới `movies`. |
| `director_id` | FK | Khóa ngoại tới `directors`. |

### 12. `watchlist`

| Cột | Kiểu gợi ý | Ghi chú |
| --- | --- | --- |
| `id` | UUID hoặc bigserial | Khóa chính. |
| `user_id` | FK | Người dùng. |
| `movie_id` | FK | Phim đã lưu. |
| `created_at` | timestamp | Thời điểm lưu. |

### 13. `watch_history`

| Cột | Kiểu gợi ý | Ghi chú |
| --- | --- | --- |
| `id` | UUID hoặc bigserial | Khóa chính. |
| `user_id` | FK | Người dùng. |
| `movie_id` | FK | Phim đã xem. |
| `episode_id` | FK nullable | Tập đã xem. |
| `progress_seconds` | integer | Tiến độ xem. |
| `duration_seconds` | integer | Tổng thời lượng video. |
| `last_watched_at` | timestamp | Lần xem gần nhất. |
| `created_at` | timestamp | Thời điểm tạo. |
| `updated_at` | timestamp | Thời điểm cập nhật. |

### 14. `ratings`

| Cột | Kiểu gợi ý | Ghi chú |
| --- | --- | --- |
| `id` | UUID hoặc bigserial | Khóa chính. |
| `user_id` | FK | Người dùng. |
| `movie_id` | FK | Phim được đánh giá. |
| `score` | integer | Điểm từ 1 đến 5. |
| `created_at` | timestamp | Thời điểm tạo. |
| `updated_at` | timestamp | Thời điểm cập nhật. |

### 15. `comments`

| Cột | Kiểu gợi ý | Ghi chú |
| --- | --- | --- |
| `id` | UUID hoặc bigserial | Khóa chính. |
| `user_id` | FK | Người bình luận. |
| `movie_id` | FK | Phim liên quan. |
| `episode_id` | FK nullable | Tập liên quan nếu có. |
| `parent_id` | FK nullable | Bình luận cha. |
| `content` | text | Nội dung. |
| `status` | varchar | `visible`, `hidden`, `pending`. |
| `created_at` | timestamp | Thời điểm tạo. |
| `updated_at` | timestamp | Thời điểm cập nhật. |

### 16. `reports`

| Cột | Kiểu gợi ý | Ghi chú |
| --- | --- | --- |
| `id` | UUID hoặc bigserial | Khóa chính. |
| `user_id` | FK nullable | Người báo lỗi nếu đã đăng nhập. |
| `movie_id` | FK | Phim bị báo lỗi. |
| `episode_id` | FK nullable | Tập bị báo lỗi nếu có. |
| `reason` | varchar | Loại lỗi. |
| `description` | text | Mô tả chi tiết. |
| `status` | varchar | `open`, `reviewing`, `resolved`, `rejected`. |
| `created_at` | timestamp | Thời điểm tạo. |
| `updated_at` | timestamp | Thời điểm cập nhật. |

### 17. `banners`

| Cột | Kiểu gợi ý | Ghi chú |
| --- | --- | --- |
| `id` | UUID hoặc bigserial | Khóa chính. |
| `movie_id` | FK nullable | Phim được gắn với banner. |
| `title` | varchar | Tiêu đề banner. |
| `image_url` | text | Ảnh banner. |
| `position` | integer | Thứ tự hiển thị. |
| `is_active` | boolean | Có bật banner không. |
| `created_at` | timestamp | Thời điểm tạo. |
| `updated_at` | timestamp | Thời điểm cập nhật. |

## C. Quan hệ bảng

- Một movie có nhiều episode.
- Một movie thuộc nhiều category.
- Một category có nhiều movie.
- Một movie thuộc một country.
- Một movie có nhiều actor.
- Một movie có nhiều director.
- Một user có nhiều watchlist.
- Một user có nhiều history.
- Một user có nhiều rating.
- Một user có nhiều comment.
- Một comment có thể có parent comment.
- Một movie có nhiều report.
- Một banner có thể gắn với một movie.

## D. Constraint và index cần có

Constraint:

- `users.email` unique.
- `movies.slug` unique.
- `categories.slug` unique.
- `countries.slug` unique.
- `actors.slug` unique.
- `directors.slug` unique.
- Không cho rating ngoài khoảng 1 đến 5.
- Không cho trùng watchlist `user_id + movie_id`.
- Không cho trùng episode `movie_id + episode_number`.
- Các bảng nối nên có khóa chính kép để tránh duplicate.
- Foreign key cần rõ ràng và có chiến lược xóa/cập nhật phù hợp.

Index gợi ý:

- `movies.slug`
- `movies.type`
- `movies.status`
- `movies.release_year`
- `movies.view_count`
- `movies.created_at`
- `episodes.movie_id`
- `episodes.movie_id + episode_number`
- `categories.slug`
- `countries.slug`
- `actors.slug`
- `directors.slug`
- `watchlist.user_id`
- `watch_history.user_id`
- `watch_history.movie_id`
- `comments.movie_id`
- `reports.status`
- `banners.is_active + position`

## E. Prisma model draft

Đây là bản nháp để thống nhất hướng thiết kế. Không tạo file `schema.prisma` thật ở bước này.

```prisma
model User {
  id             String         @id @default(uuid())
  email          String         @unique
  passwordHash   String         @map("password_hash")
  displayName    String         @map("display_name")
  avatarUrl      String?        @map("avatar_url")
  role           String         @default("user")
  status         String         @default("active")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")
  watchlist      Watchlist[]
  watchHistory   WatchHistory[]
  ratings        Rating[]
  comments       Comment[]
  reports        Report[]

  @@map("users")
}

model Role {
  id          String  @id @default(uuid())
  name        String  @unique
  description String?

  @@map("roles")
}

model Movie {
  id             String          @id @default(uuid())
  title          String
  slug           String          @unique
  originalTitle  String?         @map("original_title")
  description    String?
  posterUrl      String?         @map("poster_url")
  backdropUrl    String?         @map("backdrop_url")
  trailerUrl     String?         @map("trailer_url")
  releaseYear    Int?            @map("release_year")
  duration       String?
  totalEpisodes  Int?            @map("total_episodes")
  type           String
  status         String
  quality        String?
  language       String?
  countryId      String?         @map("country_id")
  ageRating      String?         @map("age_rating")
  viewCount      BigInt          @default(0) @map("view_count")
  averageRating  Decimal?        @map("average_rating") @db.Decimal(3, 2)
  isFeatured     Boolean         @default(false) @map("is_featured")
  isPublished    Boolean         @default(false) @map("is_published")
  createdAt      DateTime        @default(now()) @map("created_at")
  updatedAt      DateTime        @updatedAt @map("updated_at")
  country        Country?        @relation(fields: [countryId], references: [id])
  episodes       Episode[]
  categories     MovieCategory[]
  actors         MovieActor[]
  directors      MovieDirector[]
  watchlist      Watchlist[]
  watchHistory   WatchHistory[]
  ratings        Rating[]
  comments       Comment[]
  reports        Report[]
  banners        Banner[]

  @@index([type])
  @@index([status])
  @@index([releaseYear])
  @@index([viewCount])
  @@map("movies")
}

model Episode {
  id            String         @id @default(uuid())
  movieId       String         @map("movie_id")
  episodeNumber Int            @map("episode_number")
  title         String
  slug          String?
  videoUrl      String?        @map("video_url")
  thumbnailUrl  String?        @map("thumbnail_url")
  duration      String?
  viewCount     BigInt         @default(0) @map("view_count")
  isPublished   Boolean        @default(false) @map("is_published")
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")
  movie         Movie          @relation(fields: [movieId], references: [id])
  watchHistory  WatchHistory[]
  comments      Comment[]
  reports       Report[]

  @@unique([movieId, episodeNumber])
  @@index([movieId])
  @@map("episodes")
}

model Category {
  id          String          @id @default(uuid())
  name        String
  slug        String          @unique
  description String?
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")
  movies      MovieCategory[]

  @@map("categories")
}

model MovieCategory {
  movieId    String   @map("movie_id")
  categoryId String   @map("category_id")
  movie      Movie    @relation(fields: [movieId], references: [id])
  category   Category @relation(fields: [categoryId], references: [id])

  @@id([movieId, categoryId])
  @@map("movie_categories")
}

model Country {
  id     String  @id @default(uuid())
  name   String
  slug   String  @unique
  movies Movie[]

  @@map("countries")
}

model Actor {
  id        String       @id @default(uuid())
  name      String
  slug      String       @unique
  avatarUrl String?      @map("avatar_url")
  bio       String?
  movies    MovieActor[]

  @@map("actors")
}

model MovieActor {
  movieId  String @map("movie_id")
  actorId  String @map("actor_id")
  roleName String? @map("role_name")
  movie    Movie  @relation(fields: [movieId], references: [id])
  actor    Actor  @relation(fields: [actorId], references: [id])

  @@id([movieId, actorId])
  @@map("movie_actors")
}

model Director {
  id        String          @id @default(uuid())
  name      String
  slug      String          @unique
  avatarUrl String?         @map("avatar_url")
  bio       String?
  movies    MovieDirector[]

  @@map("directors")
}

model MovieDirector {
  movieId    String   @map("movie_id")
  directorId String   @map("director_id")
  movie      Movie    @relation(fields: [movieId], references: [id])
  director   Director @relation(fields: [directorId], references: [id])

  @@id([movieId, directorId])
  @@map("movie_directors")
}

model Watchlist {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  movieId   String   @map("movie_id")
  createdAt DateTime @default(now()) @map("created_at")
  user      User     @relation(fields: [userId], references: [id])
  movie     Movie    @relation(fields: [movieId], references: [id])

  @@unique([userId, movieId])
  @@index([userId])
  @@map("watchlist")
}

model WatchHistory {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  movieId         String    @map("movie_id")
  episodeId       String?   @map("episode_id")
  progressSeconds Int       @default(0) @map("progress_seconds")
  durationSeconds Int?      @map("duration_seconds")
  lastWatchedAt   DateTime  @default(now()) @map("last_watched_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  user            User      @relation(fields: [userId], references: [id])
  movie           Movie     @relation(fields: [movieId], references: [id])
  episode         Episode?  @relation(fields: [episodeId], references: [id])

  @@index([userId])
  @@index([movieId])
  @@map("watch_history")
}

model Rating {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  movieId   String   @map("movie_id")
  score     Int
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  user      User     @relation(fields: [userId], references: [id])
  movie     Movie    @relation(fields: [movieId], references: [id])

  @@unique([userId, movieId])
  @@map("ratings")
}

model Comment {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  movieId   String    @map("movie_id")
  episodeId String?   @map("episode_id")
  parentId  String?   @map("parent_id")
  content   String
  status    String    @default("visible")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  user      User      @relation(fields: [userId], references: [id])
  movie     Movie     @relation(fields: [movieId], references: [id])
  episode   Episode?  @relation(fields: [episodeId], references: [id])
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")

  @@index([movieId])
  @@map("comments")
}

model Report {
  id          String    @id @default(uuid())
  userId      String?   @map("user_id")
  movieId     String    @map("movie_id")
  episodeId   String?   @map("episode_id")
  reason      String
  description String?
  status      String    @default("open")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  user        User?     @relation(fields: [userId], references: [id])
  movie       Movie     @relation(fields: [movieId], references: [id])
  episode     Episode?  @relation(fields: [episodeId], references: [id])

  @@index([status])
  @@map("reports")
}

model Banner {
  id        String   @id @default(uuid())
  movieId   String?  @map("movie_id")
  title     String
  imageUrl  String   @map("image_url")
  position  Int      @default(0)
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  movie     Movie?   @relation(fields: [movieId], references: [id])

  @@index([isActive, position])
  @@map("banners")
}
```
