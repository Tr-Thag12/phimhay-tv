const firstValue = (value) => (Array.isArray(value) ? value[0] : value);

const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(firstValue(value), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const parsePagination = (query = {}) => {
  const page = toPositiveInteger(query.page, 1);
  const rawLimit = toPositiveInteger(query.limit, 12);
  const limit = Math.min(rawLimit, 50);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
};

export const buildPaginationMeta = (total, page, limit) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
