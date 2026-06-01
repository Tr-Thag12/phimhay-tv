import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { config } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
