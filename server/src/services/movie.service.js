import { MovieType } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { buildPaginationMeta, parsePagination } from "../utils/pagination.js";

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

const toSearchSlug = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const normalizeMovieType = (type) => {
  const value = normalizeText(type).toUpperCase();

  if (["MOVIE", "SINGLE", "PHIM_LE", "PHIM-LE"].includes(value)) {
    return MovieType.MOVIE;
  }

  if (["SERIES", "PHIM_BO", "PHIM-BO"].includes(value)) {
    return MovieType.SERIES;
  }

  return undefined;
};

const normalizeYear = (year) => {
  const parsed = Number.parseInt(firstValue(year), 10);
  return Number.isInteger(parsed) ? parsed : undefined;
};

const orderByFromSort = (sort) => {
  const value = normalizeText(sort);

  if (value === "popular") {
    return [{ viewCount: "desc" }, { createdAt: "desc" }];
  }

  if (value === "rating") {
    return [{ ratingAverage: "desc" }, { viewCount: "desc" }];
  }

  return [{ createdAt: "desc" }];
};

const buildMovieWhere = (query = {}) => {
  const q = normalizeText(query.q);
  const type = normalizeMovieType(query.type);
  const category = normalizeText(query.category);
  const country = normalizeText(query.country);
  const year = normalizeYear(query.year);

  const where = {
    isPublished: true,
  };

  if (type) {
    where.type = type;
  }

  if (category) {
    where.categories = {
      some: {
        category: {
          slug: category,
        },
      },
    };
  }

  if (country) {
    where.country = {
      slug: country,
    };
  }

  if (year) {
    where.releaseYear = year;
  }

  if (q) {
    const qSlug = toSearchSlug(q);

    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { originalTitle: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      {
        categories: {
          some: {
            category: {
              slug: {
                contains: qSlug,
                mode: "insensitive",
              },
            },
          },
        },
      },
    ];
  }

  return where;
};

const movieInclude = {
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

const mapMovieListItem = (movie) => ({
  id: movie.id,
  title: movie.title,
  slug: movie.slug,
  originalTitle: movie.originalTitle,
  description: movie.description,
  type: movie.type,
  status: movie.status,
  posterUrl: movie.posterUrl,
  backdropUrl: movie.backdropUrl,
  releaseYear: movie.releaseYear,
  durationMinutes: movie.durationMinutes,
  quality: movie.quality,
  language: movie.language,
  ageRating: movie.ageRating,
  ratingAverage: movie.ratingAverage,
  viewCount: movie.viewCount,
  isFeatured: movie.isFeatured,
  country: movie.country,
  categories: movie.categories.map((item) => item.category),
  createdAt: movie.createdAt,
  updatedAt: movie.updatedAt,
});

export const getMovies = async (query = {}) => {
  const { page, limit, skip, take } = parsePagination(query);
  const where = buildMovieWhere(query);
  const orderBy = orderByFromSort(query.sort);

  const [total, movies] = await prisma.$transaction([
    prisma.movie.count({ where }),
    prisma.movie.findMany({
      where,
      orderBy,
      skip,
      take,
      include: movieInclude,
    }),
  ]);

  return {
    items: movies.map(mapMovieListItem),
    pagination: buildPaginationMeta(total, page, limit),
  };
};

export const getMovieBySlug = async (slug) => {
  const movie = await prisma.movie.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      ...movieInclude,
      episodes: {
        where: {
          isPublished: true,
        },
        orderBy: {
          episodeNumber: "asc",
        },
      },
      banners: {
        where: {
          isActive: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!movie) {
    throw createHttpError(404, "Không tìm thấy phim");
  }

  return {
    ...mapMovieListItem(movie),
    trailerUrl: movie.trailerUrl,
    episodes: movie.episodes,
    banners: movie.banners,
  };
};

export const getEpisodesByMovieSlug = async (slug) => {
  const movie = await prisma.movie.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  if (!movie) {
    throw createHttpError(404, "Không tìm thấy phim");
  }

  const episodes = await prisma.episode.findMany({
    where: {
      movieId: movie.id,
      isPublished: true,
    },
    orderBy: {
      episodeNumber: "asc",
    },
  });

  return {
    movie,
    episodes,
  };
};

export const incrementMovieView = async (slug) => {
  const movie = await prisma.movie.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    select: {
      id: true,
    },
  });

  if (!movie) {
    throw createHttpError(404, "Không tìm thấy phim");
  }

  const updatedMovie = await prisma.movie.update({
    where: {
      id: movie.id,
    },
    data: {
      viewCount: {
        increment: 1,
      },
    },
    select: {
      slug: true,
      viewCount: true,
    },
  });

  return updatedMovie;
};
