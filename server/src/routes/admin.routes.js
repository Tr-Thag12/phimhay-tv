import { Router } from "express";

import { adminHealth } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = Router();

router.get("/health", authMiddleware, requireAdmin, adminHealth);

export default router;
