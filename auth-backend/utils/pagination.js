export const paginate = async (model, query = {}, options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const sortField = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder === "asc" ? 1 : -1;

  const total = await model.countDocuments(query);

  const data = await model
    .find(query)
    .sort({ [sortField]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate(options.populate || "");

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data,
  };
};
