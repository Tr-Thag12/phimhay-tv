import { prisma } from "../lib/prisma.js";
import { getMovies } from "./movie.service.js";

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const getCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      movies: {
        where: {
          movie: {
            isPublished: true,
          },
        },
        select: {
          movieId: true,
        },
      },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    movieCount: category.movies.length,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }));
};

export const getCategoryMovies = async (slug, query = {}) => {
  const category = await prisma.category.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  });

  if (!category) {
    throw createHttpError(404, "Không tìm thấy thể loại");
  }

  const movies = await getMovies({
    ...query,
    category: slug,
  });

  return {
    category,
    ...movies,
  };
};
