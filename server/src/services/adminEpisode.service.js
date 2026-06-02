import { EpisodeStatus, Prisma } from "@prisma/client";

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

const normalizeStatus = (value) => {
  const text = normalizeText(value).toUpperCase();
  return Object.values(EpisodeStatus).includes(text) ? text : undefined;
};

const orderByFromSort = (sort) => {
  const value = normalizeText(sort).toLowerCase();

  if (value === "oldest") {
    return [{ createdAt: "asc" }];
  }

  if (value === "episodenumber" || value === "episode_number") {
    return [{ movieId: "asc" }, { episodeNumber: "asc" }];
  }

  return [{ createdAt: "desc" }];
};

const episodeInclude = {
  movie: {
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      status: true,
      isPublished: true,
    },
  },
};

const mapEpisode = (episode) => ({
  id: episode.id,
  movieId: episode.movieId,
  movie: episode.movie,
  title: episode.title,
  slug: episode.slug,
  episodeNumber: episode.episodeNumber,
  videoUrl: episode.videoUrl,
  thumbnailUrl: episode.thumbnailUrl,
  durationMinutes: episode.durationMinutes,
  status: episode.status,
  isPublished: episode.isPublished,
  publishedAt: episode.publishedAt,
  createdAt: episode.createdAt,
  updatedAt: episode.updatedAt,
});

const buildAdminEpisodeWhere = (query = {}) => {
  const q = normalizeText(query.q);
  const movieId = normalizeText(query.movieId);
  const isPublished = parseBoolean(query.isPublished);
  const status = normalizeStatus(query.status);
  const where = {};

  if (movieId) where.movieId = movieId;
  if (isPublished !== undefined) where.isPublished = isPublished;
  if (status) where.status = status;

  if (q) {
    const qSlug = toSlug(q);
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { slug: { contains: qSlug, mode: "insensitive" } },
      { videoUrl: { contains: q, mode: "insensitive" } },
      {
        movie: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { slug: { contains: qSlug, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  return where;
};

const ensureMovieExists = async (id) => {
  const movie = await prisma.movie.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  if (!movie) {
    throw createHttpError(404, "Khong tim thay phim");
  }

  return movie;
};

const ensureEpisodeExists = async (id) => {
  const episode = await prisma.episode.findUnique({
    where: { id },
    include: episodeInclude,
  });

  if (!episode) {
    throw createHttpError(404, "Khong tim thay tap phim");
  }

  return episode;
};

const ensureEpisodeUnique = async ({ movieId, episodeNumber, slug, excludeEpisodeId }) => {
  const conflicts = [];

  if (episodeNumber !== undefined) {
    conflicts.push({ movieId, episodeNumber });
  }

  if (slug) {
    conflicts.push({ movieId, slug });
  }

  if (!conflicts.length) return;

  const existingEpisode = await prisma.episode.findFirst({
    where: {
      OR: conflicts,
      ...(excludeEpisodeId ? { NOT: { id: excludeEpisodeId } } : {}),
    },
    select: {
      id: true,
      episodeNumber: true,
      slug: true,
    },
  });

  if (!existingEpisode) return;

  if (existingEpisode.episodeNumber === episodeNumber) {
    throw createHttpError(409, "So tap da ton tai trong phim nay");
  }

  throw createHttpError(409, "Slug tap phim da ton tai trong phim nay");
};

const normalizeCreateState = (payload) => {
  const hasPublishFlag = hasOwn(payload, "isPublished");
  const requestedStatus = payload.status;
  const isPublished = hasPublishFlag
    ? payload.isPublished
    : requestedStatus === EpisodeStatus.PUBLISHED;
  const status = hasPublishFlag
    ? (isPublished ? EpisodeStatus.PUBLISHED : EpisodeStatus.HIDDEN)
    : requestedStatus ?? (isPublished ? EpisodeStatus.PUBLISHED : EpisodeStatus.DRAFT);

  return {
    isPublished,
    status,
    publishedAt: isPublished ? new Date() : null,
  };
};

const buildCreateData = (payload, slug) => {
  const state = normalizeCreateState(payload);

  return {
    movieId: payload.movieId,
    title: payload.title,
    slug,
    episodeNumber: payload.episodeNumber,
    videoUrl: payload.videoUrl,
    thumbnailUrl: payload.thumbnailUrl,
    durationMinutes: payload.durationMinutes ?? payload.duration,
    ...state,
  };
};

const buildUpdateData = (payload) => {
  const data = {};

  ["movieId", "title", "slug", "episodeNumber", "videoUrl", "thumbnailUrl"].forEach((field) => {
    if (hasOwn(payload, field)) {
      data[field] = payload[field];
    }
  });

  if (hasOwn(payload, "durationMinutes") || hasOwn(payload, "duration")) {
    data.durationMinutes = payload.durationMinutes ?? payload.duration;
  }

  if (hasOwn(payload, "isPublished")) {
    data.isPublished = payload.isPublished;
    data.status = payload.isPublished ? EpisodeStatus.PUBLISHED : EpisodeStatus.HIDDEN;
    data.publishedAt = payload.isPublished ? new Date() : null;
    return data;
  }

  if (hasOwn(payload, "status")) {
    data.status = payload.status;
    data.isPublished = payload.status === EpisodeStatus.PUBLISHED;
    data.publishedAt = payload.status === EpisodeStatus.PUBLISHED ? new Date() : null;
  }

  return data;
};

const rethrowPrismaConflict = (error) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw createHttpError(409, "Tap phim bi trung so tap hoac slug trong cung phim");
  }

  throw error;
};

export const listAdminEpisodes = async (query = {}) => {
  const { page, limit, skip, take } = parsePagination(query);
  const where = buildAdminEpisodeWhere(query);
  const orderBy = orderByFromSort(query.sort);

  const [total, episodes] = await prisma.$transaction([
    prisma.episode.count({ where }),
    prisma.episode.findMany({
      where,
      orderBy,
      skip,
      take,
      include: episodeInclude,
    }),
  ]);

  return {
    items: episodes.map(mapEpisode),
    pagination: buildPaginationMeta(total, page, limit),
  };
};

export const getAdminEpisodeById = async (id) => {
  const episode = await ensureEpisodeExists(id);
  return mapEpisode(episode);
};

export const createAdminEpisode = async (payload) => {
  await ensureMovieExists(payload.movieId);

  const slug = payload.slug || toSlug(payload.title || `tap-${payload.episodeNumber}`);
  if (!slug) {
    throw createHttpError(400, "Khong the tao slug tap phim");
  }

  await ensureEpisodeUnique({
    movieId: payload.movieId,
    episodeNumber: payload.episodeNumber,
    slug,
  });

  try {
    const episode = await prisma.episode.create({
      data: buildCreateData(payload, slug),
      include: episodeInclude,
    });

    return mapEpisode(episode);
  } catch (error) {
    rethrowPrismaConflict(error);
  }
};

export const updateAdminEpisode = async (id, payload) => {
  const currentEpisode = await ensureEpisodeExists(id);
  const movieId = payload.movieId || currentEpisode.movieId;

  if (payload.movieId) {
    await ensureMovieExists(payload.movieId);
  }

  const nextSlug = payload.slug || currentEpisode.slug;
  const nextEpisodeNumber = payload.episodeNumber ?? currentEpisode.episodeNumber;

  await ensureEpisodeUnique({
    movieId,
    episodeNumber: nextEpisodeNumber,
    slug: nextSlug,
    excludeEpisodeId: id,
  });

  try {
    const episode = await prisma.episode.update({
      where: { id },
      data: buildUpdateData(payload),
      include: episodeInclude,
    });

    return mapEpisode(episode);
  } catch (error) {
    rethrowPrismaConflict(error);
  }
};

export const softDeleteAdminEpisode = async (id) => {
  await ensureEpisodeExists(id);

  const episode = await prisma.episode.update({
    where: { id },
    data: {
      isPublished: false,
      status: EpisodeStatus.HIDDEN,
      publishedAt: null,
    },
    include: episodeInclude,
  });

  return mapEpisode(episode);
};

export const updateEpisodePublishStatus = async (id, isPublished) => {
  await ensureEpisodeExists(id);

  const episode = await prisma.episode.update({
    where: { id },
    data: {
      isPublished,
      status: isPublished ? EpisodeStatus.PUBLISHED : EpisodeStatus.HIDDEN,
      publishedAt: isPublished ? new Date() : null,
    },
    include: episodeInclude,
  });

  return mapEpisode(episode);
};
