export const successResponse = (res, message = "Success", data = null, statusCode = 200, meta = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta
  });
};

export const errorResponse = (res, message = "Something went wrong", statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};
