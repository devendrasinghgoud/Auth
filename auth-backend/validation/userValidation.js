import Joi from "joi";

export const registerValidation = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name should be at least 3 characters",
  }),
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.empty": "Username is required",
    "string.alphanum": "Username must contain only letters and numbers",
    "string.min": "Username should be at least 3 characters long",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
  }),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    "string.pattern.base": "Phone number must be a valid 10-digit number",
  }),
  password: Joi.string().min(4).required().messages({
    "string.min": "Password must be at least 4 characters long",
  }),
});

export const loginValidation = Joi.object({
  identifier: Joi.string().required().messages({
    "string.empty": "Email or username is required",
  }),
  password: Joi.string().min(4).required().messages({
    "string.min": "Password must be at least 4 characters long",
  }),
});

export const updateUserValidation = Joi.object({
  name: Joi.string().min(3).max(50).optional(),
  username: Joi.string().alphanum().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  password: Joi.string().min(4).optional(),
});

export const verifyOtpValidation = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

export const resendOtpValidation = Joi.object({
  email: Joi.string().email().required(),
});

export const forgotPasswordValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Valid email is required to send OTP",
  }),
});

export const resetPasswordValidation = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  newPassword: Joi.string().min(4).required().messages({
    "string.min": "New password must be at least 4 characters long",
  }),
});
