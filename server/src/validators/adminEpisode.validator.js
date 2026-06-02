import { EpisodeStatus } from "@prisma/client";
import { z } from "zod";

const optionalTrimmedString = (maxLength = 1000) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed || undefined;
  }, z.string().max(maxLength).optional());

const requiredId = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : ""),
  z.string().min(1, "Movie ID la bat buoc")
);

const optionalId = z.preprocess((value) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}, z.string().min(1, "Movie ID khong duoc de trong").optional());

const requiredTitle = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : ""),
  z.string().min(1, "Tieu de tap phim la bat buoc").max(180, "Tieu de tap phim khong duoc vuot qua 180 ky tu")
);

const optionalTitle = z.preprocess((value) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}, z.string().min(1, "Tieu de tap phim khong duoc de trong").max(180).optional());

const optionalSlug = z.preprocess((value) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().toLowerCase();
  return trimmed || undefined;
}, z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chi duoc gom chu thuong, so va dau gach ngang").max(180).optional());

const optionalNumber = (schema) =>
  z.preprocess((value) => {
    if (value === undefined || value === null || value === "") return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }, schema.optional());

const requiredPositiveInteger = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
}, z.number().int("So tap phai la so nguyen").min(1, "So tap phai lon hon 0"));

const episodeFields = {
  slug: optionalSlug,
  videoUrl: optionalTrimmedString(1000),
  thumbnailUrl: optionalTrimmedString(1000),
  duration: optionalNumber(
    z.number().int("Thoi luong phai la so nguyen").min(1, "Thoi luong phai lon hon 0")
  ),
  durationMinutes: optionalNumber(
    z.number().int("Thoi luong phai la so nguyen").min(1, "Thoi luong phai lon hon 0")
  ),
  status: z.nativeEnum(EpisodeStatus).optional(),
  isPublished: z.boolean().optional(),
};

const hasEditableField = (payload) => Object.keys(payload).length > 0;

const formatZodErrors = (error) =>
  error.issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
  }));

export const createAdminEpisodeSchema = z
  .object({
    movieId: requiredId,
    title: requiredTitle,
    episodeNumber: requiredPositiveInteger,
    ...episodeFields,
  })
  .strict();

export const updateAdminEpisodeSchema = z
  .object({
    movieId: optionalId,
    title: optionalTitle,
    episodeNumber: optionalNumber(
      z.number().int("So tap phai la so nguyen").min(1, "So tap phai lon hon 0")
    ),
    ...episodeFields,
  })
  .strict()
  .refine(hasEditableField, {
    message: "Can gui it nhat mot truong de cap nhat",
  });

export const publishAdminEpisodeSchema = z
  .object({
    isPublished: z.boolean({
      message: "isPublished phai la boolean",
    }),
  })
  .strict();

export const validateAdminEpisodeBody = (schema, body) => {
  const result = schema.safeParse(body);

  if (!result.success) {
    const error = new Error("Du lieu tap phim gui len khong hop le");
    error.statusCode = 400;
    error.errors = formatZodErrors(result.error);
    throw error;
  }

  return result.data;
};
