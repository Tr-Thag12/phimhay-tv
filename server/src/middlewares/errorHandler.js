import { config } from "../config/env.js";
import { errorResponse } from "../utils/response.js";

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const errors = {};

  if (err.errors) {
    errors.details = err.errors;
  }

  if (config.nodeEnv !== "production" && err.stack) {
    errors.stack = err.stack;
  }

  return errorResponse(
    res,
    err.message || "Lỗi server",
    statusCode,
    Object.keys(errors).length > 0 ? errors : undefined
  );
};
