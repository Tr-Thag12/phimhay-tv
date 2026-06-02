import { successResponse } from "../utils/response.js";

export const adminHealth = (req, res) => {
  return successResponse(
    res,
    {
      role: req.user.role,
      email: req.user.email,
      timestamp: new Date().toISOString(),
    },
    "Khu vực admin hoạt động"
  );
};
