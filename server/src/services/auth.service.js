import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Prisma, Role } from "@prisma/client";

import { config } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const getDefaultDisplayName = (email) => email.split("@")[0] || "Người dùng PhimHay";

export const toSafeUser = (user) => ({
  id: user.id,
  email: user.email,
  displayName: user.name,
  avatarUrl: user.avatarUrl,
  role: user.role,
  status: user.isActive ? "ACTIVE" : "INACTIVE",
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const createAuthToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
    }
  );

export const registerUser = async ({ email, password, displayName }) => {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    throw createHttpError(409, "Email đã tồn tại");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: displayName || getDefaultDisplayName(normalizedEmail),
        role: Role.USER,
        isActive: true,
      },
    });

    return toSafeUser(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw createHttpError(409, "Email đã tồn tại");
    }

    throw error;
  }
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    throw createHttpError(401, "Email hoặc mật khẩu không đúng");
  }

  if (!user.isActive) {
    throw createHttpError(403, "Tài khoản không hoạt động");
  }

  if (!user.passwordHash) {
    throw createHttpError(401, "Email hoặc mật khẩu không đúng");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw createHttpError(401, "Email hoặc mật khẩu không đúng");
  }

  return {
    token: createAuthToken(user),
    user: toSafeUser(user),
  };
};

export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw createHttpError(404, "Không tìm thấy người dùng");
  }

  if (!user.isActive) {
    throw createHttpError(403, "Tài khoản không hoạt động");
  }

  return toSafeUser(user);
};
