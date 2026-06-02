import { Router } from "express";

import { adminHealth } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import adminMovieRoutes from "./adminMovie.routes.js";

const router = Router();

router.use(authMiddleware, requireAdmin);

router.get("/health", adminHealth);
router.use("/movies", adminMovieRoutes);

export default router;
