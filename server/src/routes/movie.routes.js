import { Router } from "express";

import {
  increaseMovieView,
  listMovieEpisodes,
  listMovies,
  showMovie,
} from "../controllers/movie.controller.js";

const router = Router();

router.get("/", listMovies);
router.get("/:slug", showMovie);
router.get("/:slug/episodes", listMovieEpisodes);
router.post("/:slug/view", increaseMovieView);

export default router;
