import { errorResponse } from "../utils/response.js";

export const notFound = (req, res) => {
  return errorResponse(res, `Không tìm thấy route ${req.originalUrl}`, 404);
};
