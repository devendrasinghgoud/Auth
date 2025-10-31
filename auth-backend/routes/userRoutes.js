import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Model/User.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; 

const generateOtp = () => ({
  otp: Math.floor(100000 + Math.random() * 900000).toString(),
  otpExpires: Date.now() + 3 * 60 * 1000, 
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone)
      return res.status(400).json({ success: false, message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const { otp, otpExpires } = generateOtp();

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false,
    });

    await user.save();

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
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: err.message,
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ success: false, message: "User already verified" });

    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (Date.now() > user.otpExpires)
      return res.status(400).json({ success: false, message: "OTP expired. Please resend." });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.json({ success: true, message: "Email verified successfully. You can now log in." });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying OTP",
      error: err.message,
    });
  }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ success: false, message: "User already verified" });

    const { otp, otpExpires } = generateOtp();
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendEmail(
      email,
      "Resend OTP - Verification",
      `Hi ${user.name},\n\nYour new OTP is: ${otp}\nIt expires in 3 minutes.\n\nThank you!`
    );

    return res.json({ success: true, message: "New OTP sent successfully. Please check your email." });
  } catch (err) {
    console.error("RESEND OTP ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while resending OTP",
      error: err.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (!user.isVerified)
      return res.status(403).json({ success: false, message: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
      error: err.message,
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email)
      return res.status(400).json({ success: false, message: "Email is required" });

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
      `Hi ${user.name},\n\nYour OTP to reset your password is: ${otp}\nIt expires in 3 minutes.\n\nThank you!`
    );

    return res.json({ success: true, message: "OTP sent to your email for password reset." });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while sending password reset OTP",
      error: err.message,
    });
  }
});

router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (Date.now() > user.otpExpires)
      return res.status(400).json({ success: false, message: "OTP expired" });

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.json({ success: true, message: "OTP verified successfully. You can now reset your password." });
  } catch (err) {
    console.error("VERIFY RESET OTP ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying reset OTP",
      error: err.message,
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({ success: false, message: "Email and new password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful. Please log in with your new password.",
    });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while resetting password",
      error: err.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password -otp -otpExpires");
    return res.json({ success: true, users });
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching users",
      error: err.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -otp -otpExpires");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    return res.json({ success: true, user });
  } catch (err) {
    console.error("GET USER BY ID ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user by ID",
      error: err.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updateData = { name, email };
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password -otp -otpExpires");

    if (!updatedUser)
      return res.status(404).json({ success: false, message: "User not found" });

    return res.json({ success: true, message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while updating user",
      error: err.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ success: false, message: "User not found" });

    return res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting user",
      error: err.message,
    });
  }
});

export default router;
