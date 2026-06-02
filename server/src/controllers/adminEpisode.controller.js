import {
  createAdminEpisode,
  getAdminEpisodeById,
  listAdminEpisodes,
  softDeleteAdminEpisode,
  updateAdminEpisode,
  updateEpisodePublishStatus,
} from "../services/adminEpisode.service.js";
import {
  createAdminEpisodeSchema,
  publishAdminEpisodeSchema,
  updateAdminEpisodeSchema,
  validateAdminEpisodeBody,
} from "../validators/adminEpisode.validator.js";
import { successResponse } from "../utils/response.js";

export const listEpisodes = async (req, res, next) => {
  try {
    const data = await listAdminEpisodes(req.query);
    return successResponse(res, data, "Lay danh sach tap phim admin thanh cong");
  } catch (error) {
    return next(error);
  }
};

export const showEpisode = async (req, res, next) => {
  try {
    const episode = await getAdminEpisodeById(req.params.id);
    return successResponse(res, { episode }, "Lay chi tiet tap phim admin thanh cong");
  } catch (error) {
    return next(error);
  }
};

export const createEpisode = async (req, res, next) => {
  try {
    const payload = validateAdminEpisodeBody(createAdminEpisodeSchema, req.body);
    const episode = await createAdminEpisode(payload);
    return successResponse(res, { episode }, "Tao tap phim admin thanh cong", 201);
  } catch (error) {
    return next(error);
  }
};

export const updateEpisode = async (req, res, next) => {
  try {
    const payload = validateAdminEpisodeBody(updateAdminEpisodeSchema, req.body);
    const episode = await updateAdminEpisode(req.params.id, payload);
    return successResponse(res, { episode }, "Cap nhat tap phim admin thanh cong");
  } catch (error) {
    return next(error);
  }
};

export const deleteEpisode = async (req, res, next) => {
  try {
    const episode = await softDeleteAdminEpisode(req.params.id);
    return successResponse(res, { episode }, "Da an tap phim khoi he thong");
  } catch (error) {
    return next(error);
  }
};

export const publishEpisode = async (req, res, next) => {
  try {
    const payload = validateAdminEpisodeBody(publishAdminEpisodeSchema, req.body);
    const episode = await updateEpisodePublishStatus(req.params.id, payload.isPublished);
    return successResponse(res, { episode }, "Cap nhat trang thai publish tap phim thanh cong");
  } catch (error) {
    return next(error);
  }
};
