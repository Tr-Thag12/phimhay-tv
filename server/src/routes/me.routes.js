import { Router } from "express";

import {
  addMyWatchlistMovie,
  listMyWatchlist,
  removeMyWatchlistMovie,
} from "../controllers/userWatchlist.controller.js";
import {
  clearMyHistory,
  listMyHistory,
  removeMyHistoryItem,
  saveMyHistory,
} from "../controllers/userHistory.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/watchlist", listMyWatchlist);
router.post("/watchlist/:movieId", addMyWatchlistMovie);
router.delete("/watchlist/:movieId", removeMyWatchlistMovie);

router.get("/history", listMyHistory);
router.post("/history", saveMyHistory);
router.delete("/history/:id", removeMyHistoryItem);
router.delete("/history", clearMyHistory);

export default router;
