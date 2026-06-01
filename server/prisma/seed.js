import {
  BannerPosition,
  CommentStatus,
  EpisodeStatus,
  MovieStatus,
  MovieType,
  PrismaClient,
  ReportStatus,
  Role,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const placeholderImage = (text, size = "640x960") =>
  `https://placehold.co/${size}/141821/F2F4F8?text=${encodeURIComponent(text)}`;

const countriesSeed = [
  { name: "Việt Nam", slug: "viet-nam", code: "VN" },
  { name: "Hàn Quốc", slug: "han-quoc", code: "KR" },
  { name: "Nhật Bản", slug: "nhat-ban", code: "JP" },
  { name: "Mỹ", slug: "my", code: "US" },
  { name: "Trung Quốc", slug: "trung-quoc", code: "CN" },
];

const categoriesSeed = [
  { name: "Hành động", slug: "hanh-dong" },
  { name: "Tình cảm", slug: "tinh-cam" },
  { name: "Kinh dị", slug: "kinh-di" },
  { name: "Hài", slug: "hai" },
  { name: "Phiêu lưu", slug: "phieu-luu" },
  { name: "Tâm lý", slug: "tam-ly" },
  { name: "Hoạt hình", slug: "hoat-hinh" },
  { name: "Viễn tưởng", slug: "vien-tuong" },
];

const moviesSeed = [
  {
    title: "Bóng Đêm Sài Gòn",
    slug: "bong-dem-sai-gon",
    originalTitle: "Saigon After Dark",
    description:
      "Một điều tra viên trẻ lần theo chuỗi vụ mất tích bí ẩn trong những con hẻm Sài Gòn về đêm.",
    type: MovieType.MOVIE,
    status: MovieStatus.PUBLISHED,
    releaseYear: 2025,
    durationMinutes: 112,
    quality: "4K",
    language: "Tiếng Việt",
    ageRating: "16+",
    ratingAverage: 8.6,
    viewCount: 185000,
    isFeatured: true,
    isPublished: true,
    countrySlug: "viet-nam",
    categorySlugs: ["hanh-dong", "kinh-di", "tam-ly"],
    episodes: [
      {
        episodeNumber: 1,
        title: "Full",
        slug: "tap-1",
        durationMinutes: 112,
      },
    ],
  },
  {
    title: "Mùa Sao Băng Trở Lại",
    slug: "mua-sao-bang-tro-lai",
    originalTitle: "Return of Meteor Season",
    description:
      "Một nhóm bạn gặp lại nhau sau nhiều năm và cùng chữa lành những ký ức bỏ quên dưới bầu trời Seoul.",
    type: MovieType.SERIES,
    status: MovieStatus.PUBLISHED,
    releaseYear: 2024,
    durationMinutes: 48,
    quality: "Full HD",
    language: "Phụ đề Việt",
    ageRating: "13+",
    ratingAverage: 8.3,
    viewCount: 142000,
    isFeatured: true,
    isPublished: true,
    countrySlug: "han-quoc",
    categorySlugs: ["tinh-cam", "tam-ly"],
    episodes: [
      { episodeNumber: 1, title: "Ngày gặp lại", slug: "tap-1", durationMinutes: 47 },
      { episodeNumber: 2, title: "Lời hứa cũ", slug: "tap-2", durationMinutes: 49 },
      { episodeNumber: 3, title: "Dưới cơn mưa sao", slug: "tap-3", durationMinutes: 50 },
    ],
  },
  {
    title: "Vệt Nắng Cuối Tuần",
    slug: "vet-nang-cuoi-tuan",
    originalTitle: "Weekend Sunlight",
    description:
      "Một phim lẻ nhẹ nhàng về tình bạn, gia đình và lựa chọn trưởng thành của những người trẻ ở Đà Lạt.",
    type: MovieType.MOVIE,
    status: MovieStatus.PUBLISHED,
    releaseYear: 2023,
    durationMinutes: 96,
    quality: "Full HD",
    language: "Tiếng Việt",
    ageRating: "13+",
    ratingAverage: 7.9,
    viewCount: 78000,
    isFeatured: false,
    isPublished: true,
    countrySlug: "viet-nam",
    categorySlugs: ["tinh-cam", "hai"],
    episodes: [
      {
        episodeNumber: 1,
        title: "Full",
        slug: "tap-1",
        durationMinutes: 96,
      },
    ],
  },
  {
    title: "Thành Phố Không Ngủ",
    slug: "thanh-pho-khong-ngu",
    originalTitle: "Sleepless City",
    description:
      "Một đội đặc nhiệm truy tìm nguồn phát tín hiệu lạ đang làm đảo lộn toàn bộ hệ thống thành phố.",
    type: MovieType.SERIES,
    status: MovieStatus.PUBLISHED,
    releaseYear: 2025,
    durationMinutes: 52,
    quality: "4K",
    language: "Lồng tiếng Việt",
    ageRating: "16+",
    ratingAverage: 8.1,
    viewCount: 99000,
    isFeatured: false,
    isPublished: true,
    countrySlug: "my",
    categorySlugs: ["hanh-dong", "phieu-luu", "vien-tuong"],
    episodes: [
      { episodeNumber: 1, title: "Tín hiệu đầu tiên", slug: "tap-1", durationMinutes: 52 },
      { episodeNumber: 2, title: "Mật mã dưới lòng đất", slug: "tap-2", durationMinutes: 51 },
      { episodeNumber: 3, title: "Thành phố thức giấc", slug: "tap-3", durationMinutes: 53 },
    ],
  },
  {
    title: "Dự Án Bí Mật 404",
    slug: "du-an-bi-mat-404",
    originalTitle: "Project 404",
    description:
      "Một dự án viễn tưởng chưa phát hành, dùng để kiểm thử trạng thái phim ẩn trong hệ thống.",
    type: MovieType.MOVIE,
    status: MovieStatus.HIDDEN,
    releaseYear: 2026,
    durationMinutes: 104,
    quality: "HD",
    language: "Phụ đề Việt",
    ageRating: "16+",
    ratingAverage: 0,
    viewCount: 0,
    isFeatured: false,
    isPublished: false,
    countrySlug: "nhat-ban",
    categorySlugs: ["vien-tuong", "hoat-hinh"],
    episodes: [
      {
        episodeNumber: 1,
        title: "Bản nháp",
        slug: "tap-1",
        durationMinutes: 104,
        isPublished: false,
        status: EpisodeStatus.HIDDEN,
      },
    ],
  },
];

async function clearData() {
  await prisma.report.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.watchHistory.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.movieCategory.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.category.deleteMany();
  await prisma.country.deleteMany();
  await prisma.user.deleteMany();
}

async function seedCountries() {
  const countries = {};

  for (const country of countriesSeed) {
    countries[country.slug] = await prisma.country.create({
      data: country,
    });
  }

  return countries;
}

async function seedCategories() {
  const categories = {};

  for (const category of categoriesSeed) {
    categories[category.slug] = await prisma.category.create({
      data: {
        ...category,
        description: `Thể loại ${category.name} của PhimHay TV.`,
      },
    });
  }

  return categories;
}

async function seedUsers() {
  const adminPasswordHash = await bcrypt.hash("Admin@123456", 12);
  const userPasswordHash = await bcrypt.hash("User@123456", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@phimhay.local",
      passwordHash: adminPasswordHash,
      name: "Quản trị viên",
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "user@phimhay.local",
      passwordHash: userPasswordHash,
      name: "Người dùng mẫu",
      role: Role.USER,
      isActive: true,
    },
  });

  return { admin, user };
}

async function seedMovies() {
  const movies = {};

  for (const movie of moviesSeed) {
    const createdMovie = await prisma.movie.create({
      data: {
        title: movie.title,
        slug: movie.slug,
        originalTitle: movie.originalTitle,
        description: movie.description,
        type: movie.type,
        status: movie.status,
        posterUrl: placeholderImage(movie.title, "640x960"),
        backdropUrl: placeholderImage(movie.title, "1280x720"),
        trailerUrl: "https://example.com/trailers/phimhay-tv-demo.mp4",
        releaseYear: movie.releaseYear,
        durationMinutes: movie.durationMinutes,
        quality: movie.quality,
        language: movie.language,
        ageRating: movie.ageRating,
        ratingAverage: movie.ratingAverage,
        viewCount: movie.viewCount,
        isFeatured: movie.isFeatured,
        isPublished: movie.isPublished,
        country: {
          connect: {
            slug: movie.countrySlug,
          },
        },
        categories: {
          create: movie.categorySlugs.map((slug) => ({
            category: {
              connect: { slug },
            },
          })),
        },
        episodes: {
          create: movie.episodes.map((episode) => ({
            episodeNumber: episode.episodeNumber,
            title: episode.title,
            slug: episode.slug,
            videoUrl: "https://example.com/videos/phimhay-tv-demo.mp4",
            thumbnailUrl: placeholderImage(`${movie.title} ${episode.title}`, "640x360"),
            durationMinutes: episode.durationMinutes,
            status: episode.status || EpisodeStatus.PUBLISHED,
            isPublished: episode.isPublished ?? true,
            publishedAt: episode.isPublished === false ? null : new Date(),
          })),
        },
      },
      include: {
        episodes: true,
      },
    });

    movies[createdMovie.slug] = createdMovie;
  }

  return movies;
}

async function seedBanners(movies) {
  await prisma.banner.createMany({
    data: [
      {
        movieId: movies["bong-dem-sai-gon"].id,
        title: "Bóng Đêm Sài Gòn",
        subtitle: "Phim nổi bật trên PhimHay TV",
        imageUrl: placeholderImage("Bóng Đêm Sài Gòn", "1280x720"),
        linkUrl: "/phim/bong-dem-sai-gon",
        position: BannerPosition.HOME_HERO,
        sortOrder: 1,
        isActive: true,
      },
      {
        movieId: movies["mua-sao-bang-tro-lai"].id,
        title: "Mùa Sao Băng Trở Lại",
        subtitle: "Series tình cảm Hàn Quốc",
        imageUrl: placeholderImage("Mùa Sao Băng Trở Lại", "1280x720"),
        linkUrl: "/phim/mua-sao-bang-tro-lai",
        position: BannerPosition.HOME_HERO,
        sortOrder: 2,
        isActive: true,
      },
    ],
  });
}

async function seedUserActivity(user, movies) {
  const bongDem = movies["bong-dem-sai-gon"];
  const saoBang = movies["mua-sao-bang-tro-lai"];
  const bongDemEpisode = bongDem.episodes.find((episode) => episode.episodeNumber === 1);
  const saoBangEpisode = saoBang.episodes.find((episode) => episode.episodeNumber === 2);

  await prisma.watchlist.createMany({
    data: [
      { userId: user.id, movieId: bongDem.id },
      { userId: user.id, movieId: saoBang.id },
    ],
  });

  await prisma.watchHistory.createMany({
    data: [
      {
        userId: user.id,
        movieId: bongDem.id,
        episodeId: bongDemEpisode.id,
        progressSeconds: 3600,
        durationSeconds: 6720,
      },
      {
        userId: user.id,
        movieId: saoBang.id,
        episodeId: saoBangEpisode.id,
        progressSeconds: 1200,
        durationSeconds: 2940,
      },
    ],
  });

  await prisma.rating.createMany({
    data: [
      {
        userId: user.id,
        movieId: bongDem.id,
        score: 9,
        review: "Không khí phim tốt, hợp để kiểm thử dữ liệu rating.",
      },
      {
        userId: user.id,
        movieId: saoBang.id,
        score: 8,
        review: "Series nhẹ nhàng, dữ liệu mẫu đủ cho API sau này.",
      },
    ],
  });

  const comment = await prisma.comment.create({
    data: {
      userId: user.id,
      movieId: bongDem.id,
      episodeId: bongDemEpisode.id,
      content: "Bình luận mẫu để kiểm thử luồng comment sau này.",
      status: CommentStatus.APPROVED,
    },
  });

  await prisma.report.create({
    data: {
      reporterId: user.id,
      movieId: bongDem.id,
      commentId: comment.id,
      type: "demo_report",
      reason: "Báo cáo mẫu để kiểm thử quan hệ report.",
      status: ReportStatus.OPEN,
    },
  });
}

async function main() {
  console.log("Bắt đầu seed dữ liệu mẫu PhimHay TV...");
  console.log("Seed user mẫu dev với password_hash bcryptjs thật.");

  await clearData();
  await seedCountries();
  await seedCategories();
  const { user } = await seedUsers();
  const movies = await seedMovies();
  await seedBanners(movies);
  await seedUserActivity(user, movies);

  console.log("Seed dữ liệu mẫu PhimHay TV hoàn tất.");
}

main()
  .catch((error) => {
    console.error("Seed dữ liệu mẫu thất bại:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
