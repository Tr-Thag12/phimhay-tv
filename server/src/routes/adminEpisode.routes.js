import { Router } from "express";

import {
  createEpisode,
  deleteEpisode,
  listEpisodes,
  publishEpisode,
  showEpisode,
  updateEpisode,
} from "../controllers/adminEpisode.controller.js";

const router = Router();

router.get("/", listEpisodes);
router.post("/", createEpisode);
router.get("/:id", showEpisode);
router.patch("/:id/publish", publishEpisode);
router.patch("/:id", updateEpisode);
router.delete("/:id", deleteEpisode);

export default router;
