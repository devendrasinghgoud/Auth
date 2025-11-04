import express from "express";
import {
  registerUser,
  verifyOtp,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  logoutUser,
} from "../modules/auth/authController.js";

import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  verifyOtpValidation,
} from "../validation/authValidation.js";

import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";

const router = express.Router();

router.post("/register", validate(registerValidation), registerUser);
router.post("/verify-otp", validate(verifyOtpValidation), verifyOtp);
router.post("/login", validate(loginValidation), loginUser);
router.post("/forgot-password", validate(forgotPasswordValidation), forgotPassword);
router.post("/reset-password", validate(resetPasswordValidation), resetPassword);
router.get("/profile", protect, getProfile);
router.post("/logout", logoutUser);

export default router;
