import {
  registerUserService,
  verifyOtpService,
  loginUserService,
  forgotPasswordService,
  resetPasswordService,
  getProfileService,
  resendOtpService,
} from "./authService.js";

export const registerUser = async (req, res) => {
  try {
    await registerUserService(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { token, user } = await verifyOtpService(req.body);
    res.json({
      success: true,
      message: "Email verified successfully.",
      token,
      user,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const resendOtp = async (req, res) => {
  try {
    await resendOtpService(req.body.email);
    res.json({
      success: true,
      message: "A new OTP has been sent to your email.",
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { token, user } = await loginUserService(req.body);
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
    res.status(400).json({ success: false, message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    await forgotPasswordService(req.body.email);
    res.json({
      success: true,
      message: "Password reset OTP sent to your email.",
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    await resetPasswordService(req.body);
    res.json({
      success: true,
      message: "Password reset successful.",
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await getProfileService(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};
