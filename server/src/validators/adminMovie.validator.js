import { MovieStatus, MovieType } from "@prisma/client";
import { z } from "zod";

const optionalTrimmedString = (maxLength = 500) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed || undefined;
  }, z.string().max(maxLength).optional());

const requiredTitle = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : ""),
  z
    .string()
    .min(1, "Tiêu đề phim là bắt buộc")
    .max(180, "Tiêu đề phim không được vượt quá 180 ký tự")
);

const optionalTitle = z.preprocess((value) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}, z.string().min(1, "Tiêu đề phim không được để trống").max(180).optional());

const optionalSlug = z.preprocess((value) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().toLowerCase();
  return trimmed || undefined;
}, z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ được gồm chữ thường, số và dấu gạch ngang").max(180).optional());

const optionalNumber = (schema) =>
  z.preprocess((value) => {
    if (value === undefined || value === null || value === "") return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }, schema.optional());

const optionalId = z.preprocess((value) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}, z.string().min(1, "Id không được để trống").optional());

const categoryIds = z
  .array(z.string().trim().min(1, "Id thể loại không được để trống"))
  .optional();

const movieFields = {
  slug: optionalSlug,
  originalTitle: optionalTrimmedString(180),
  description: optionalTrimmedString(5000),
  posterUrl: optionalTrimmedString(1000),
  backdropUrl: optionalTrimmedString(1000),
  trailerUrl: optionalTrimmedString(1000),
  releaseYear: optionalNumber(
    z
      .number()
      .int("Năm phát hành phải là số nguyên")
      .min(1900, "Năm phát hành phải từ 1900")
      .max(2100, "Năm phát hành không được vượt quá 2100")
  ),
  duration: optionalNumber(
    z.number().int("Thời lượng phải là số nguyên").min(1, "Thời lượng phải lớn hơn 0")
  ),
  durationMinutes: optionalNumber(
    z.number().int("Thời lượng phải là số nguyên").min(1, "Thời lượng phải lớn hơn 0")
  ),
  type: z.nativeEnum(MovieType).optional(),
  status: z.nativeEnum(MovieStatus).optional(),
  quality: optionalTrimmedString(80),
  language: optionalTrimmedString(80),
  ageRating: optionalTrimmedString(40),
  countryId: optionalId,
  categoryIds,
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
};

const hasEditableField = (payload) => Object.keys(payload).length > 0;

const formatZodErrors = (error) =>
  error.issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
  }));

export const createAdminMovieSchema = z
  .object({
    title: requiredTitle,
    ...movieFields,
  })
  .strict();

export const updateAdminMovieSchema = z
  .object({
    title: optionalTitle,
    ...movieFields,
  })
  .strict()
  .refine(hasEditableField, {
    message: "Cần gửi ít nhất một trường để cập nhật",
  });

export const publishAdminMovieSchema = z
  .object({
    isPublished: z.boolean({
      message: "isPublished phải là boolean",
    }),
  })
  .strict();

export const featuredAdminMovieSchema = z
  .object({
    isFeatured: z.boolean({
      message: "isFeatured phải là boolean",
    }),
  })
  .strict();

export const validateAdminMovieBody = (schema, body) => {
  const result = schema.safeParse(body);

  if (!result.success) {
    const error = new Error("Dữ liệu phim gửi lên không hợp lệ");
    error.statusCode = 400;
    error.errors = formatZodErrors(result.error);
    throw error;
  }

  return result.data;
};
