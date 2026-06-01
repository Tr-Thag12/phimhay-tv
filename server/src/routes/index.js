import { Router } from "express";

import categoryRoutes from "./category.routes.js";
import healthRoutes from "./health.routes.js";
import movieRoutes from "./movie.routes.js";
import searchRoutes from "./search.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/movies", movieRoutes);
router.use("/categories", categoryRoutes);
router.use("/search", searchRoutes);

export default router;
