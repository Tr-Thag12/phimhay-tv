import { PrismaClient } from "@prisma/client";

import { config } from "../config/env.js";

export const prisma = new PrismaClient({
  log: config.nodeEnv === "development" ? ["warn", "error"] : ["error"],
});
