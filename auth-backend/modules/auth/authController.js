import {
  registerUserService,
  verifyOtpService,
  loginUserService,
  forgotPasswordService,
  resetPasswordService,
  getProfileService,
  resendOtpService,
} from "./authService.js";
import logger from "../../utils/logger.js";

export const registerUser = async (req, res) => {
  try {
    await registerUserService(req.body);
    logger.info(`User registration initiated for ${req.body.email}`);
    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
    });
  } catch (err) {
    logger.error(`Register User Error: ${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { token, user } = await verifyOtpService(req.body);
    logger.info(`OTP verified for ${user.email}`);
    res.json({
      success: true,
      message: "Email verified successfully.",
      token,
      user,
    });
  } catch (err) {
    logger.error(`Verify OTP Error: ${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const resendOtp = async (req, res) => {
  try {
    await resendOtpService(req.body.email);
    logger.info(`OTP resent to ${req.body.email}`);
    res.json({
      success: true,
      message: "A new OTP has been sent to your email.",
    });
  } catch (err) {
    logger.error(`Resend OTP Error: ${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { token, user } = await loginUserService(req.body);
    logger.info(`User logged in: ${user.email}`);
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        token,
      },
    });
  } catch (err) {
    logger.error(`Login User Error: ${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    await forgotPasswordService(req.body.email);
    logger.info(`Password reset OTP sent to ${req.body.email}`);
    res.json({
      success: true,
      message: "Password reset OTP sent to your email.",
    });
  } catch (err) {
    logger.error(`Forgot Password Error: ${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    await resetPasswordService(req.body);
    logger.info(`Password reset for ${req.body.email}`);
    res.json({
      success: true,
      message: "Password reset successful.",
    });
  } catch (err) {
    logger.error(`Reset Password Error: ${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await getProfileService(req.user.id);
    logger.info(`Fetched profile for user ID: ${req.user.id}`);
    res.json({ success: true, user });
  } catch (err) {
    logger.error(`Get Profile Error: ${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    logger.info(`User logged out successfully`);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    logger.error(`Logout User Error: ${err.message}`);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};
