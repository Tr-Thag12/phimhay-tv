import { MovieStatus, MovieType } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { buildPaginationMeta } from "../utils/pagination.js";

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const firstValue = (value) => (Array.isArray(value) ? value[0] : value);

const normalizeText = (value) => {
  const normalized = firstValue(value);
  return typeof normalized === "string" ? normalized.trim() : "";
};

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const toSlug = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(firstValue(value), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parsePagination = (query = {}) => {
  const page = parsePositiveInteger(query.page, 1);
  const rawLimit = parsePositiveInteger(query.limit, 20);
  const limit = Math.min(rawLimit, 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
};

const parseBoolean = (value) => {
  const normalized = firstValue(value);

  if (typeof normalized === "boolean") return normalized;
  if (typeof normalized !== "string") return undefined;

  const text = normalized.trim().toLowerCase();

  if (["true", "1", "yes"].includes(text)) return true;
  if (["false", "0", "no"].includes(text)) return false;

  return undefined;
};

const normalizeEnum = (enumObject, value) => {
  const text = normalizeText(value).toUpperCase();
  return Object.values(enumObject).includes(text) ? text : undefined;
};

const orderByFromSort = (sort) => {
  const value = normalizeText(sort).toLowerCase();

  if (value === "oldest") {
    return [{ createdAt: "asc" }];
  }

  if (value === "popular") {
    return [{ viewCount: "desc" }, { createdAt: "desc" }];
  }

  if (value === "title") {
    return [{ title: "asc" }, { createdAt: "desc" }];
  }

  return [{ createdAt: "desc" }];
};

const normalizeCategoryIds = (categoryIds) => {
  if (!Array.isArray(categoryIds)) return undefined;
  return [...new Set(categoryIds.map((id) => String(id).trim()).filter(Boolean))];
};

const adminMovieInclude = {
  country: {
    select: {
      id: true,
      name: true,
      slug: true,
      code: true,
    },
  },
  categories: {
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
};

const adminMovieDetailInclude = {
  ...adminMovieInclude,
  episodes: {
    orderBy: {
      episodeNumber: "asc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      episodeNumber: true,
      videoUrl: true,
      thumbnailUrl: true,
      durationMinutes: true,
      status: true,
      isPublished: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  banners: {
    orderBy: {
      sortOrder: "asc",
    },
    select: {
      id: true,
      title: true,
      subtitle: true,
      imageUrl: true,
      linkUrl: true,
      position: true,
      sortOrder: true,
      isActive: true,
      startsAt: true,
      endsAt: true,
      createdAt: true,
      updatedAt: true,
    },
  },
};

const mapMovie = (movie) => ({
  id: movie.id,
  title: movie.title,
  slug: movie.slug,
  originalTitle: movie.originalTitle,
  description: movie.description,
  type: movie.type,
  status: movie.status,
  posterUrl: movie.posterUrl,
  backdropUrl: movie.backdropUrl,
  trailerUrl: movie.trailerUrl,
  releaseYear: movie.releaseYear,
  durationMinutes: movie.durationMinutes,
  quality: movie.quality,
  language: movie.language,
  ageRating: movie.ageRating,
  ratingAverage: movie.ratingAverage,
  viewCount: movie.viewCount,
  isFeatured: movie.isFeatured,
  isPublished: movie.isPublished,
  country: movie.country,
  categories: movie.categories?.map((item) => item.category) || [],
  episodes: movie.episodes,
  banners: movie.banners,
  createdAt: movie.createdAt,
  updatedAt: movie.updatedAt,
});

const buildAdminMovieWhere = (query = {}) => {
  const q = normalizeText(query.q);
  const type = normalizeEnum(MovieType, query.type);
  const status = normalizeEnum(MovieStatus, query.status);
  const country = normalizeText(query.country);
  const category = normalizeText(query.category);
  const isPublished = parseBoolean(query.isPublished);

  const where = {};

  if (type) where.type = type;
  if (status) where.status = status;
  if (isPublished !== undefined) where.isPublished = isPublished;

  if (country) {
    where.country = {
      OR: [
        { id: country },
        { slug: country.toLowerCase() },
        { code: country.toUpperCase() },
      ],
    };
  }

  if (category) {
    where.categories = {
      some: {
        category: {
          OR: [{ id: category }, { slug: category.toLowerCase() }],
        },
      },
    };
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { originalTitle: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { slug: { contains: toSlug(q), mode: "insensitive" } },
    ];
  }

  return where;
};

const ensureMovieExists = async (id) => {
  const movie = await prisma.movie.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  if (!movie) {
    throw createHttpError(404, "Không tìm thấy phim");
  }

  return movie;
};

const ensureSlugUnique = async (slug, excludeMovieId) => {
  const existingMovie = await prisma.movie.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existingMovie && existingMovie.id !== excludeMovieId) {
    throw createHttpError(409, "Slug phim đã tồn tại");
  }
};

const ensureCountryExists = async (countryId) => {
  if (!countryId) return;

  const country = await prisma.country.findUnique({
    where: {
      id: countryId,
    },
    select: {
      id: true,
    },
  });

  if (!country) {
    throw createHttpError(400, "Quốc gia không tồn tại");
  }
};

const ensureCategoriesExist = async (categoryIds) => {
  if (!categoryIds) return;
  if (categoryIds.length === 0) return;

  const categories = await prisma.category.findMany({
    where: {
      id: {
        in: categoryIds,
      },
    },
    select: {
      id: true,
    },
  });

  if (categories.length !== categoryIds.length) {
    throw createHttpError(400, "Một hoặc nhiều thể loại không tồn tại");
  }
};

const buildCreateData = (payload, slug) => {
  const isPublished =
    payload.isPublished ?? payload.status === MovieStatus.PUBLISHED ?? false;
  const status = payload.status ?? (isPublished ? MovieStatus.PUBLISHED : MovieStatus.DRAFT);
  const durationMinutes = payload.durationMinutes ?? payload.duration;

  return {
    title: payload.title,
    slug,
    originalTitle: payload.originalTitle,
    description: payload.description,
    type: payload.type ?? MovieType.MOVIE,
    status,
    posterUrl: payload.posterUrl,
    backdropUrl: payload.backdropUrl,
    trailerUrl: payload.trailerUrl,
    releaseYear: payload.releaseYear,
    durationMinutes,
    quality: payload.quality,
    language: payload.language,
    ageRating: payload.ageRating,
    isFeatured: payload.isFeatured ?? false,
    isPublished,
    countryId: payload.countryId,
  };
};

const buildUpdateData = (payload) => {
  const data = {};

  [
    "title",
    "slug",
    "originalTitle",
    "description",
    "posterUrl",
    "backdropUrl",
    "trailerUrl",
    "releaseYear",
    "quality",
    "language",
    "ageRating",
    "type",
    "status",
    "isFeatured",
    "isPublished",
    "countryId",
  ].forEach((field) => {
    if (hasOwn(payload, field)) {
      data[field] = payload[field];
    }
  });

  if (hasOwn(payload, "durationMinutes") || hasOwn(payload, "duration")) {
    data.durationMinutes = payload.durationMinutes ?? payload.duration;
  }

  if (hasOwn(payload, "isPublished") && !hasOwn(payload, "status")) {
    data.status = payload.isPublished ? MovieStatus.PUBLISHED : MovieStatus.HIDDEN;
  }

  return data;
};

const findMovieForResponse = (id, include = adminMovieInclude) =>
  prisma.movie.findUnique({
    where: {
      id,
    },
    include,
  });

export const listAdminMovies = async (query = {}) => {
  const { page, limit, skip, take } = parsePagination(query);
  const where = buildAdminMovieWhere(query);
  const orderBy = orderByFromSort(query.sort);

  const [total, movies] = await prisma.$transaction([
    prisma.movie.count({ where }),
    prisma.movie.findMany({
      where,
      orderBy,
      skip,
      take,
      include: adminMovieInclude,
    }),
  ]);

  return {
    items: movies.map(mapMovie),
    pagination: buildPaginationMeta(total, page, limit),
  };
};

export const getAdminMovieById = async (id) => {
  const movie = await findMovieForResponse(id, adminMovieDetailInclude);

  if (!movie) {
    throw createHttpError(404, "Không tìm thấy phim");
  }

  return mapMovie(movie);
};

export const createAdminMovie = async (payload) => {
  const slug = payload.slug || toSlug(payload.title);
  const categoryIds = normalizeCategoryIds(payload.categoryIds);

  if (!slug) {
    throw createHttpError(400, "Không thể tạo slug từ tiêu đề phim");
  }

  await ensureSlugUnique(slug);
  await ensureCountryExists(payload.countryId);
  await ensureCategoriesExist(categoryIds);

  const movie = await prisma.movie.create({
    data: {
      ...buildCreateData(payload, slug),
      categories: categoryIds?.length
        ? {
            create: categoryIds.map((categoryId) => ({
              category: {
                connect: {
                  id: categoryId,
                },
              },
            })),
          }
        : undefined,
    },
    include: adminMovieInclude,
  });

  return mapMovie(movie);
};

export const updateAdminMovie = async (id, payload) => {
  await ensureMovieExists(id);

  const categoryIds = normalizeCategoryIds(payload.categoryIds);
  const nextSlug = payload.slug;

  if (nextSlug) {
    await ensureSlugUnique(nextSlug, id);
  }

  await ensureCountryExists(payload.countryId);
  await ensureCategoriesExist(categoryIds);

  const updatedMovie = await prisma.$transaction(async (transaction) => {
    const movie = await transaction.movie.update({
      where: {
        id,
      },
      data: buildUpdateData(payload),
      include: adminMovieInclude,
    });

    if (categoryIds) {
      await transaction.movieCategory.deleteMany({
        where: {
          movieId: id,
        },
      });

      if (categoryIds.length > 0) {
        await transaction.movieCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            movieId: id,
            categoryId,
          })),
        });
      }

      return transaction.movie.findUnique({
        where: {
          id,
        },
        include: adminMovieInclude,
      });
    }

    return movie;
  });

  return mapMovie(updatedMovie);
};

export const softDeleteAdminMovie = async (id) => {
  await ensureMovieExists(id);

  const movie = await prisma.movie.update({
    where: {
      id,
    },
    data: {
      isPublished: false,
      isFeatured: false,
      status: MovieStatus.HIDDEN,
    },
    include: adminMovieInclude,
  });

  return mapMovie(movie);
};

export const updateMoviePublishStatus = async (id, isPublished) => {
  await ensureMovieExists(id);

  const movie = await prisma.movie.update({
    where: {
      id,
    },
    data: {
      isPublished,
      status: isPublished ? MovieStatus.PUBLISHED : MovieStatus.HIDDEN,
    },
    include: adminMovieInclude,
  });

  return mapMovie(movie);
};

export const updateMovieFeaturedStatus = async (id, isFeatured) => {
  await ensureMovieExists(id);

  const movie = await prisma.movie.update({
    where: {
      id,
    },
    data: {
      isFeatured,
    },
    include: adminMovieInclude,
  });

  return mapMovie(movie);
};
