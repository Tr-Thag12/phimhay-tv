import { Router } from "express";

import { adminHealth } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import adminEpisodeRoutes from "./adminEpisode.routes.js";
import adminMovieRoutes from "./adminMovie.routes.js";

const router = Router();

router.use(authMiddleware, requireAdmin);

router.get("/health", adminHealth);
router.use("/movies", adminMovieRoutes);
router.use("/episodes", adminEpisodeRoutes);

export default router;
