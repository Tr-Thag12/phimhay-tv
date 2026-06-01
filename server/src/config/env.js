import dotenv from "dotenv";

dotenv.config({ quiet: true });

const toPort = (value) => {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 ? port : 4000;
};

export const config = {
  port: toPort(process.env.PORT),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

if (!config.databaseUrl) {
  console.log(
    "[Cảnh báo PhimHay TV API] Thiếu DATABASE_URL. Backend skeleton vẫn chạy, nhưng Prisma chưa kết nối database."
  );
}
