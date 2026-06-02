import { Router } from "express";

import adminRoutes from "./admin.routes.js";
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
router.use("/admin", adminRoutes);

export default router;
