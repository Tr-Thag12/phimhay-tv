import { Router } from "express";

import authRoutes from "./auth.routes.js";
import categoryRoutes from "./category.routes.js";
import healthRoutes from "./health.routes.js";
import meRoutes from "./me.routes.js";
import movieRoutes from "./movie.routes.js";
import searchRoutes from "./search.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/movies", movieRoutes);
router.use("/categories", categoryRoutes);
router.use("/search", searchRoutes);
router.use("/me", meRoutes);

export default router;
