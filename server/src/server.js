import app from "./app.js";
import { config } from "./config/env.js";

const server = app.listen(config.port, () => {
  console.log(`Backend PhimHay TV đang chạy tại http://localhost:${config.port}`);
  console.log(`Health check: http://localhost:${config.port}/api/health`);
});

const shutdown = () => {
  server.close(() => {
    console.log("Backend PhimHay TV đã dừng.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
