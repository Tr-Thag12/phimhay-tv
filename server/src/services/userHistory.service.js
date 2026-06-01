import { prisma } from "../lib/prisma.js";
import { mapLibraryMovie } from "./userWatchlist.service.js";

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const historyInclude = {
  movie: {
    include: {
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
    },
  },
  episode: {
    select: {
      id: true,
      movieId: true,
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
};

const mapHistoryItem = (item) => ({
  id: item.id,
  userId: item.userId,
  movieId: item.movieId,
  episodeId: item.episodeId,
  progressSeconds: item.progressSeconds,
  durationSeconds: item.durationSeconds,
  watchedAt: item.watchedAt,
  lastWatchedAt: item.watchedAt,
  movie: mapLibraryMovie(item.movie),
  episode: item.episode,
});

const parseLimit = (query = {}) => {
  const value = Number.parseInt(Array.isArray(query.limit) ? query.limit[0] : query.limit, 10);
  if (!Number.isInteger(value) || value <= 0) return 20;
  return Math.min(value, 100);
};

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

const findPublishedEpisode = async (movieId, episodeId) => {
  if (!episodeId) return null;

  const episode = await prisma.episode.findFirst({
    where: {
      id: episodeId,
      movieId,
      isPublished: true,
    },
    select: {
      id: true,
    },
  });

  if (!episode) {
    throw createHttpError(404, "Không tìm thấy tập phim");
  }

  return episode;
};

export const getUserHistory = async (userId, query = {}) => {
  const items = await prisma.watchHistory.findMany({
    where: {
      userId,
      movie: {
        isPublished: true,
      },
    },
    orderBy: {
      watchedAt: "desc",
    },
    take: parseLimit(query),
    include: historyInclude,
  });

  return {
    items: items.map(mapHistoryItem),
  };
};

export const saveUserHistory = async (
  userId,
  { movieId, episodeId = null, progressSeconds = 0, durationSeconds = null }
) => {
  await findPublishedMovie(movieId);
  await findPublishedEpisode(movieId, episodeId);

  const existingItem = await prisma.watchHistory.findFirst({
    where: {
      userId,
      movieId,
      episodeId,
    },
    select: {
      id: true,
    },
  });

  const data = {
    progressSeconds,
    durationSeconds,
    watchedAt: new Date(),
  };

  const item = existingItem
    ? await prisma.watchHistory.update({
        where: {
          id: existingItem.id,
        },
        data,
        include: historyInclude,
      })
    : await prisma.watchHistory.create({
        data: {
          userId,
          movieId,
          episodeId,
          ...data,
        },
        include: historyInclude,
      });

  return mapHistoryItem(item);
};

export const removeUserHistoryItem = async (userId, historyId) => {
  await prisma.watchHistory.deleteMany({
    where: {
      id: historyId,
      userId,
    },
  });

  return null;
};

export const clearUserHistory = async (userId) => {
  await prisma.watchHistory.deleteMany({
    where: {
      userId,
    },
  });

  return null;
};
