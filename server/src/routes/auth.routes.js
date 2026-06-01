import rateLimit from "express-rate-limit";
import { Router } from "express";

import { login, logout, me, register } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { errorResponse } from "../utils/response.js";

const router = Router();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) =>
    errorResponse(
      res,
      "Bạn thao tác quá nhanh. Vui lòng thử lại sau.",
      429
    ),
});

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.get("/me", authMiddleware, me);
router.post("/logout", authMiddleware, logout);

export default router;
