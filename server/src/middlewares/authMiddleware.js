import jwt from "jsonwebtoken";

import { config } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { toSafeUser } from "../services/auth.service.js";
import { errorResponse } from "../utils/response.js";

const getBearerToken = (authorizationHeader) => {
  if (!authorizationHeader || typeof authorizationHeader !== "string") {
    return "";
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return "";
  }

  return token.trim();
};

export const authMiddleware = async (req, res, next) => {
  const token = getBearerToken(req.headers.authorization);

  if (!token) {
    return errorResponse(res, "Thiếu token xác thực", 401);
  }

  let payload;

  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return errorResponse(res, "Token không hợp lệ hoặc đã hết hạn", 401);
  }

  try {
    const userId = payload.sub || payload.userId;

    if (!userId) {
      return errorResponse(res, "Token không hợp lệ hoặc đã hết hạn", 401);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: String(userId),
      },
    });

    if (!user) {
      return errorResponse(res, "Người dùng không tồn tại", 401);
    }

    if (!user.isActive) {
      return errorResponse(res, "Tài khoản không hoạt động", 403);
    }

    req.user = toSafeUser(user);
    req.auth = payload;

    return next();
  } catch (error) {
    return next(error);
  }
};

export default authMiddleware;
