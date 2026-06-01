import {
  getCategories,
  getCategoryMovies,
} from "../services/category.service.js";
import { successResponse } from "../utils/response.js";

export const listCategories = async (req, res, next) => {
  try {
    const categories = await getCategories();
    return successResponse(res, { items: categories }, "Lấy danh sách thể loại thành công");
  } catch (error) {
    return next(error);
  }
};

export const listMoviesByCategory = async (req, res, next) => {
  try {
    const data = await getCategoryMovies(req.params.slug, req.query);
    return successResponse(res, data, "Lấy danh sách phim theo thể loại thành công");
  } catch (error) {
    return next(error);
  }
};
