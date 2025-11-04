import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import sendEmail from "../../utils/sendEmail.js";
import { generateToken } from "../../utils/generateToken.js";
import { generateOtp } from "../../utils/generateOtp.js";

export const registerUser = async (req, res) => {
  try {
    const { name, username, email, phone, password } = req.body;

    if (!name || !username || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phone }],
    });

    if (existingUser) {
      const field =
        existingUser.email === email
          ? "Email"
          : existingUser.username === username
          ? "Username"
          : "Phone";
      return res.status(400).json({ success: false, message: `${field} already registered` });
    }

    const { otp, otpExpires } = generateOtp();

    const user = await User.create({
      name,
      username,
      email: email.toLowerCase(),
      phone,
      password, // plain password; schema will hash before saving
      otp,
      otpExpires,
    });

    await sendEmail(
      email,
      "Verify Your Email - OTP",
      `Hi ${name},\n\nYour OTP for verification is: ${otp}\nIt expires in 3 minutes.\n\nThank you!`
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ success: false, message: "Registration failed" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ success: false, message: "User already verified" });
    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (Date.now() > user.otpExpires)
      return res.status(400).json({ success: false, message: "OTP expired" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user);
    return res.json({
      success: true,
      message: "Email verified successfully.",
      token,
      user,
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).json({ success: false, message: "OTP verification failed" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Username and password required",
      });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier },
      ],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        token,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const { otp, otpExpires } = generateOtp();
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendEmail(
      email,
      "Password Reset OTP",
      `Hi ${user.name},\n\nYour OTP for password reset is: ${otp}\nIt expires in 3 minutes.\n\nThank you!`
    );

    return res.json({
      success: true,
      message: "Password reset OTP sent to your email.",
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).json({ success: false, message: "Error sending reset OTP" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });
    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (Date.now() > user.otpExpires)
      return res.status(400).json({ success: false, message: "OTP expired" });

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful.",
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({ success: false, message: "Reset password failed" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpires");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    return res.json({ success: true, user });
  } catch (err) {
    console.error("Get Profile Error:", err);
    return res.status(500).json({ success: false, message: "Unable to fetch profile" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout Error:", err);
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
};
