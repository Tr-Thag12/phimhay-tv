import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/auth.service.js";
import {
  loginSchema,
  registerSchema,
  validateBody,
} from "../validators/auth.validator.js";
import { successResponse } from "../utils/response.js";

export const register = async (req, res, next) => {
  try {
    const payload = validateBody(registerSchema, req.body);
    const user = await registerUser(payload);

    return successResponse(
      res,
      { user },
      "Đăng ký tài khoản thành công",
      201
    );
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const payload = validateBody(loginSchema, req.body);
    const data = await loginUser(payload);

    return successResponse(res, data, "Đăng nhập thành công");
  } catch (error) {
    return next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.id);

    return successResponse(
      res,
      { user },
      "Lấy thông tin người dùng thành công"
    );
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    return successResponse(res, null, "Đăng xuất thành công");
  } catch (error) {
    return next(error);
  }
};
