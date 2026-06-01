import { Router } from "express";

import {
  listCategories,
  listMoviesByCategory,
} from "../controllers/category.controller.js";

const router = Router();

router.get("/", listCategories);
router.get("/:slug/movies", listMoviesByCategory);

export default router;
