import logger from "../utils/logger.js";

export const notFound = (req, res, next) => {
  const message = `Not Found - ${req.originalUrl}`;
  
  // Log the missing route
  logger.warn(message, {
    meta: {
      method: req.method,
      ip: req.ip,
    },
  });

  const error = new Error(message);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log the error in detail
  logger.error(`ERROR: ${err.message}`, {
    meta: {
      statusCode,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      user: req.user?._id,
      stack: err.stack,
    },
  });

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
