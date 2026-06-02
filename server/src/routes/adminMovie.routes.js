import { Router } from "express";

import {
  createMovie,
  deleteMovie,
  featureMovie,
  listMovies,
  publishMovie,
  showMovie,
  updateMovie,
} from "../controllers/adminMovie.controller.js";

const router = Router();

router.get("/", listMovies);
router.post("/", createMovie);
router.get("/:id", showMovie);
router.patch("/:id/publish", publishMovie);
router.patch("/:id/featured", featureMovie);
router.patch("/:id", updateMovie);
router.delete("/:id", deleteMovie);

export default router;
