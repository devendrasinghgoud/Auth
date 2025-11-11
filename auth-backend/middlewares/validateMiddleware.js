import { errorResponse } from "../api/apiResponse.js";
import Logger from "../utils/logger.js";

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body, { abortEarly: false });
      if (error) {
        Logger.warn(`Validation failed: ${error.details.map(d => d.message).join(", ")}`, {
          path: req.originalUrl,
          method: req.method,
          body: req.body,
        });
        return errorResponse(res, error.details[0].message, 400);
      }
      next();
    } catch (err) {
      Logger.error("Validation Middleware Error", { error: err.message, stack: err.stack });
      return errorResponse(res, "Internal validation error", 500);
    }
  };
};
