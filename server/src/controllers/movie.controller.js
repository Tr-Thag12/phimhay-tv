import {
  getEpisodesByMovieSlug,
  getMovieBySlug,
  getMovies,
  incrementMovieView,
} from "../services/movie.service.js";
import { successResponse } from "../utils/response.js";

export const listMovies = async (req, res, next) => {
  try {
    const data = await getMovies(req.query);
    return successResponse(res, data, "Lấy danh sách phim thành công");
  } catch (error) {
    return next(error);
  }
};

export const showMovie = async (req, res, next) => {
  try {
    const movie = await getMovieBySlug(req.params.slug);
    return successResponse(res, { movie }, "Lấy chi tiết phim thành công");
  } catch (error) {
    return next(error);
  }
};

export const listMovieEpisodes = async (req, res, next) => {
  try {
    const data = await getEpisodesByMovieSlug(req.params.slug);
    return successResponse(res, data, "Lấy danh sách tập phim thành công");
  } catch (error) {
    return next(error);
  }
};

export const increaseMovieView = async (req, res, next) => {
  try {
    const data = await incrementMovieView(req.params.slug);
    return successResponse(res, data, "Tăng lượt xem phim thành công");
  } catch (error) {
    return next(error);
  }
};
