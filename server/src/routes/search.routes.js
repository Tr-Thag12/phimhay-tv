import { Router } from "express";

import { searchMovies } from "../controllers/search.controller.js";

const router = Router();

router.get("/", searchMovies);

export default router;
