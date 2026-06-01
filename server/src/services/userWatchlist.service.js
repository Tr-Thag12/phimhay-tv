import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
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

export const mapLibraryMovie = (movie) => ({
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
  categories: (movie.categories || []).map((item) => item.category),
  createdAt: movie.createdAt,
  updatedAt: movie.updatedAt,
});

const mapWatchlistItem = (item) => ({
  id: item.id,
  userId: item.userId,
  movieId: item.movieId,
  createdAt: item.createdAt,
  movie: mapLibraryMovie(item.movie),
});

const findPublishedMovie = async (movieId) => {
  const movie = await prisma.movie.findFirst({
    where: {
      id: movieId,
      isPublished: true,
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

export const getUserWatchlist = async (userId) => {
  const items = await prisma.watchlist.findMany({
    where: {
      userId,
      movie: {
        isPublished: true,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      movie: {
        include: movieInclude,
      },
    },
  });

  return {
    items: items.map(mapWatchlistItem),
  };
};

export const addUserWatchlistMovie = async (userId, movieId) => {
  await findPublishedMovie(movieId);

  const existingItem = await prisma.watchlist.findUnique({
    where: {
      userId_movieId: {
        userId,
        movieId,
      },
    },
    include: {
      movie: {
        include: movieInclude,
      },
    },
  });

  if (existingItem) {
    return mapWatchlistItem(existingItem);
  }

  try {
    const item = await prisma.watchlist.create({
      data: {
        userId,
        movieId,
      },
      include: {
        movie: {
          include: movieInclude,
        },
      },
    });

    return mapWatchlistItem(item);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const item = await prisma.watchlist.findUnique({
        where: {
          userId_movieId: {
            userId,
            movieId,
          },
        },
        include: {
          movie: {
            include: movieInclude,
          },
        },
      });

      if (item) return mapWatchlistItem(item);
    }

    throw error;
  }
};

export const removeUserWatchlistMovie = async (userId, movieId) => {
  await prisma.watchlist.deleteMany({
    where: {
      userId,
      movieId,
    },
  });

  return null;
};
