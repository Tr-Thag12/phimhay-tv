import { z } from "zod";

const requiredEmail = z
  .preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ")
  )
  .transform((email) => email.toLowerCase());

const registerPassword = z.preprocess(
  (value) => (typeof value === "string" ? value : ""),
  z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự")
);

const loginPassword = z.preprocess(
  (value) => (typeof value === "string" ? value : ""),
  z.string().min(1, "Mật khẩu là bắt buộc")
);

const displayName = z.preprocess((value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue || undefined;
}, z.string().max(80, "Tên hiển thị không được vượt quá 80 ký tự").optional());

export const registerSchema = z
  .object({
    email: requiredEmail,
    password: registerPassword,
    displayName,
  })
  .strict();

export const loginSchema = z
  .object({
    email: requiredEmail,
    password: loginPassword,
  })
  .strict();

const formatZodErrors = (error) =>
  error.issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
  }));

export const validateBody = (schema, body) => {
  const result = schema.safeParse(body);

  if (!result.success) {
    const error = new Error("Dữ liệu gửi lên không hợp lệ");
    error.statusCode = 400;
    error.errors = formatZodErrors(result.error);
    throw error;
  }

  return result.data;
};
