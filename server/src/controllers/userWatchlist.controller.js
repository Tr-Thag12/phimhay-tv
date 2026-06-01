import {
  addUserWatchlistMovie,
  getUserWatchlist,
  removeUserWatchlistMovie,
} from "../services/userWatchlist.service.js";
import { successResponse } from "../utils/response.js";

export const listMyWatchlist = async (req, res, next) => {
  try {
    const data = await getUserWatchlist(req.user.id);
    return successResponse(res, data, "Lấy danh sách yêu thích thành công");
  } catch (error) {
    return next(error);
  }
};

export const addMyWatchlistMovie = async (req, res, next) => {
  try {
    const item = await addUserWatchlistMovie(req.user.id, req.params.movieId);
    return successResponse(
      res,
      { item },
      "Đã thêm phim vào danh sách yêu thích"
    );
  } catch (error) {
    return next(error);
  }
};

export const removeMyWatchlistMovie = async (req, res, next) => {
  try {
    await removeUserWatchlistMovie(req.user.id, req.params.movieId);
    return successResponse(
      res,
      null,
      "Đã xóa phim khỏi danh sách yêu thích"
    );
  } catch (error) {
    return next(error);
  }
};
