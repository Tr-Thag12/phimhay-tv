import { z } from "zod";

import {
  clearUserHistory,
  getUserHistory,
  removeUserHistoryItem,
  saveUserHistory,
} from "../services/userHistory.service.js";
import { successResponse } from "../utils/response.js";

const historySchema = z
  .object({
    movieId: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      z.string().min(1, "movieId là bắt buộc")
    ),
    episodeId: z
      .preprocess((value) => {
        if (typeof value !== "string") return null;
        const trimmedValue = value.trim();
        return trimmedValue || null;
      }, z.string().min(1).nullable())
      .optional()
      .default(null),
    progressSeconds: z
      .preprocess(
        (value) => Number.parseInt(value ?? 0, 10),
        z.number().int().min(0)
      )
      .optional()
      .default(0),
    durationSeconds: z
      .preprocess((value) => {
        if (value === null || value === undefined || value === "") return null;
        return Number.parseInt(value, 10);
      }, z.number().int().min(0).nullable())
      .optional()
      .default(null),
  })
  .strict();

const formatZodErrors = (error) =>
  error.issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
  }));

const validateBody = (schema, body) => {
  const result = schema.safeParse(body);

  if (!result.success) {
    const error = new Error("Dữ liệu gửi lên không hợp lệ");
    error.statusCode = 400;
    error.errors = formatZodErrors(result.error);
    throw error;
  }

  return result.data;
};

export const listMyHistory = async (req, res, next) => {
  try {
    const data = await getUserHistory(req.user.id, req.query);
    return successResponse(res, data, "Lấy lịch sử xem thành công");
  } catch (error) {
    return next(error);
  }
};

export const saveMyHistory = async (req, res, next) => {
  try {
    const payload = validateBody(historySchema, req.body);
    const item = await saveUserHistory(req.user.id, payload);
    return successResponse(res, { item }, "Đã cập nhật lịch sử xem");
  } catch (error) {
    return next(error);
  }
};

export const removeMyHistoryItem = async (req, res, next) => {
  try {
    await removeUserHistoryItem(req.user.id, req.params.id);
    return successResponse(res, null, "Đã xóa mục lịch sử xem");
  } catch (error) {
    return next(error);
  }
};

export const clearMyHistory = async (req, res, next) => {
  try {
    await clearUserHistory(req.user.id);
    return successResponse(res, null, "Đã xóa toàn bộ lịch sử xem");
  } catch (error) {
    return next(error);
  }
};
