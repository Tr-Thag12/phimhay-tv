import {
  createAdminMovie,
  getAdminMovieById,
  listAdminMovies,
  softDeleteAdminMovie,
  updateAdminMovie,
  updateMovieFeaturedStatus,
  updateMoviePublishStatus,
} from "../services/adminMovie.service.js";
import {
  createAdminMovieSchema,
  featuredAdminMovieSchema,
  publishAdminMovieSchema,
  updateAdminMovieSchema,
  validateAdminMovieBody,
} from "../validators/adminMovie.validator.js";
import { successResponse } from "../utils/response.js";

export const listMovies = async (req, res, next) => {
  try {
    const data = await listAdminMovies(req.query);
    return successResponse(res, data, "Lấy danh sách phim admin thành công");
  } catch (error) {
    return next(error);
  }
};

export const showMovie = async (req, res, next) => {
  try {
    const movie = await getAdminMovieById(req.params.id);
    return successResponse(res, { movie }, "Lấy chi tiết phim admin thành công");
  } catch (error) {
    return next(error);
  }
};

export const createMovie = async (req, res, next) => {
  try {
    const payload = validateAdminMovieBody(createAdminMovieSchema, req.body);
    const movie = await createAdminMovie(payload);
    return successResponse(res, { movie }, "Tạo phim admin thành công", 201);
  } catch (error) {
    return next(error);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const payload = validateAdminMovieBody(updateAdminMovieSchema, req.body);
    const movie = await updateAdminMovie(req.params.id, payload);
    return successResponse(res, { movie }, "Cập nhật phim admin thành công");
  } catch (error) {
    return next(error);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await softDeleteAdminMovie(req.params.id);
    return successResponse(res, { movie }, "Đã ẩn phim khỏi hệ thống");
  } catch (error) {
    return next(error);
  }
};

export const publishMovie = async (req, res, next) => {
  try {
    const payload = validateAdminMovieBody(publishAdminMovieSchema, req.body);
    const movie = await updateMoviePublishStatus(req.params.id, payload.isPublished);
    return successResponse(res, { movie }, "Cập nhật trạng thái publish phim thành công");
  } catch (error) {
    return next(error);
  }
};

export const featureMovie = async (req, res, next) => {
  try {
    const payload = validateAdminMovieBody(featuredAdminMovieSchema, req.body);
    const movie = await updateMovieFeaturedStatus(req.params.id, payload.isFeatured);
    return successResponse(res, { movie }, "Cập nhật trạng thái nổi bật phim thành công");
  } catch (error) {
    return next(error);
  }
};
