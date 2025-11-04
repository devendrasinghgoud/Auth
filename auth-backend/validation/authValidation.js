import Joi from "joi";

export const registerValidation = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    "string.empty": "First name is required",
    "string.min": "First name must be at least 2 characters",
    "string.max": "First name cannot exceed 50 characters",
  }),

  lastName: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Last name is required",
    "string.min": "Last name must be at least 2 characters",
    "string.max": "Last name cannot exceed 50 characters",
  }),

  username: Joi.string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9._]+$/)
    .required()
    .messages({
      "string.empty": "Username is required",
      "string.pattern.base": "Username can only contain letters, numbers, dots, and underscores",
      "string.min": "Username must be at least 3 characters",
      "string.max": "Username cannot exceed 20 characters",
    }),

  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Phone number must be 10 digits",
    }),

  password: Joi.string().min(4).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 4 characters long",
  }),
});

export const loginValidation = Joi.object({
  identifier: Joi.string().required().messages({
    "string.empty": "Email or Username is required",
  }),
  password: Joi.string().min(4).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 4 characters long",
  }),
});

export const verifyOtpValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
  otp: Joi.string().length(6).required().messages({
    "string.empty": "OTP is required",
    "string.length": "OTP must be 6 digits",
  }),
});

export const forgotPasswordValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
});

export const resetPasswordValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
  otp: Joi.string().length(6).required().messages({
    "string.empty": "OTP is required",
    "string.length": "OTP must be 6 digits",
  }),
  newPassword: Joi.string().min(4).required().messages({
    "string.empty": "New password is required",
    "string.min": "New password must be at least 4 characters long",
  }),
});
