import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
} from "../modules/users/userController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  updateUserValidation,
  verifyOtpValidation,
  resendOtpValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../validation/userValidation.js";

const router = express.Router();

router.get("/", protect, getAllUsers);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, validate(updateUserValidation), updateUser);
router.delete("/:id", protect, deleteUser);

router.post("/verify-otp", validate(verifyOtpValidation), verifyOtp);
router.post("/resend-otp", validate(resendOtpValidation), resendOtp);
router.post("/forgot-password", validate(forgotPasswordValidation), forgotPassword);
router.post("/reset-password", validate(resetPasswordValidation), resetPassword);

export default router;
