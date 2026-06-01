import { Router } from "express";

import { successResponse } from "../utils/response.js";

const router = Router();

router.get("/", (req, res) => {
  return successResponse(
    res,
    {
      service: "phimhay-tv-api",
      status: "ok",
      timestamp: new Date().toISOString(),
    },
    "Backend PhimHay TV đang hoạt động"
  );
});

export default router;
