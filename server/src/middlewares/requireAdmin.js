import { errorResponse } from "../utils/response.js";

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return errorResponse(res, "Không đủ quyền admin", 403);
  }

  return next();
};

export default requireAdmin;
