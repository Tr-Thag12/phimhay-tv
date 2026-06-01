import dotenv from "dotenv";

dotenv.config({ quiet: true });

const toPort = (value) => {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 ? port : 4000;
};

const nodeEnv = process.env.NODE_ENV || "development";
const fallbackDevJwtSecret = "dev_change_me_to_a_long_random_secret";
const jwtSecret =
  process.env.JWT_SECRET || (nodeEnv === "production" ? "" : fallbackDevJwtSecret);

export const config = {
  port: toPort(process.env.PORT),
  nodeEnv,
  databaseUrl: process.env.DATABASE_URL || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};

if (!config.databaseUrl) {
  console.log(
    "[Cảnh báo PhimHay TV API] Thiếu DATABASE_URL. Backend skeleton vẫn chạy, nhưng Prisma chưa kết nối database."
  );
}

if (!process.env.JWT_SECRET) {
  if (config.nodeEnv === "production") {
    throw new Error(
      "[Lỗi PhimHay TV API] Thiếu JWT_SECRET trong môi trường production."
    );
  }

  console.warn(
    "[Cảnh báo PhimHay TV API] Thiếu JWT_SECRET. Đang dùng JWT secret dev fallback, chỉ phù hợp cho local."
  );
}
