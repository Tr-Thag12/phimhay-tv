import { getMovies } from "../services/movie.service.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";
import { successResponse } from "../utils/response.js";

export const searchMovies = async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

    if (!q) {
      const { page, limit } = parsePagination(req.query);
      return successResponse(
        res,
        {
          items: [],
          pagination: buildPaginationMeta(0, page, limit),
        },
        "Vui lòng nhập từ khóa tìm kiếm"
      );
    }

    const data = await getMovies({
      ...req.query,
      q,
    });

    return successResponse(res, data, "Tìm kiếm phim thành công");
  } catch (error) {
    return next(error);
  }
};
