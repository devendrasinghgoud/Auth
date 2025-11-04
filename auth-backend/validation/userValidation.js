import Joi from "joi";

// ✅ REGISTER VALIDATION
export const registerValidation = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    "string.empty": "First name is required",
    "string.min": "First name must be at least 2 characters long",
    "string.max": "First name cannot exceed 50 characters",
  }),

  lastName: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Last name is required",
    "string.min": "Last name must be at least 2 characters long",
    "string.max": "Last name cannot exceed 50 characters",
  }),

  username: Joi.string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9._]+$/)
    .required()
    .messages({
      "string.empty": "Username is required",
      "string.pattern.base":
        "Username can only contain letters, numbers, dots, and underscores",
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
      "string.pattern.base": "Phone number must be a valid 10-digit number",
    }),

  password: Joi.string().min(4).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 4 characters long",
  }),
});

// ✅ UPDATE USER VALIDATION
export const updateUserValidation = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  username: Joi.string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9._]+$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Username can only contain letters, numbers, dots, and underscores",
    }),
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      "string.pattern.base": "Phone number must be a valid 10-digit number",
    }),
  password: Joi.string().min(4).optional().messages({
    "string.min": "Password must be at least 4 characters long",
  }),
});

// ✅ VERIFY OTP VALIDATION
export const verifyOtpValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
  otp: Joi.string().length(6).required().messages({
    "string.empty": "OTP is required",
    "string.length": "OTP must be 6 digits long",
  }),
});

// ✅ RESEND OTP VALIDATION
export const resendOtpValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
});

// ✅ FORGOT PASSWORD VALIDATION
export const forgotPasswordValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Valid email is required to send OTP",
  }),
});

// ✅ RESET PASSWORD VALIDATION
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
