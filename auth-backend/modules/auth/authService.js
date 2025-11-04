import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import sendEmail from "../../utils/sendEmail.js";
import { generateToken } from "../../utils/generateToken.js";
import { generateOtp } from "../../utils/generateOtp.js";

export const registerUserService = async ({
  firstName,
  lastName,
  username,
  email,
  phone,
  password,
}) => {
  if (!firstName || !lastName || !username || !email || !phone || !password) {
    throw new Error("All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username }, { phone }],
  });

  if (existingUser) {
    const field =
      existingUser.email === email.toLowerCase()
        ? "Email"
        : existingUser.username === username
        ? "Username"
        : "Phone";
    throw new Error(`${field} already registered`);
  }

  const { otp, otpExpires } = generateOtp();

  const user = await User.create({
    firstName,
    lastName,
    username,
    email: email.toLowerCase(),
    phone,
    password,
    otp,
    otpExpires,
  });

  await sendEmail(
    email,
    "Verify Your Email - OTP",
    `Hi ${firstName},\n\nYour OTP for email verification is: ${otp}\nIt expires in 3 minutes.\n\nThank you!`
  );

  return {
    success: true,
    message: "User registered successfully. OTP sent to your email.",
    userId: user._id,
  };
};


export const verifyOtpService = async ({ email, otp }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("User already verified");
  if (user.otp !== otp) throw new Error("Invalid OTP");
  if (Date.now() > user.otpExpires) throw new Error("OTP expired");

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  const token = generateToken(user);

  return {
    success: true,
    message: "Email verified successfully",
    token,
    user,
  };
};

export const resendOtpService = async (email) => {
  if (!email) throw new Error("Email is required");

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("User already verified");

  const { otp, otpExpires } = generateOtp();

  user.otp = otp;
  user.otpExpires = otpExpires;

  await user.save();

  await sendEmail(
    user.email,
    "Resend OTP - Email Verification",
    `Hi ${user.firstName},\n\nYour new OTP for verification is: ${otp}\nIt expires in 3 minutes.\n\nThank you!`
  );

  return {
    success: true,
    message: "A new OTP has been sent to your email.",
  };
};

export const loginUserService = async ({ identifier, password }) => {
  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier },
    ],
  });

  if (!user) throw new Error("User not found");
  if (!user.isVerified) throw new Error("Please verify your email first");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = generateToken(user);
  return {
    success: true,
    message: "Login successful",
    token,
    user,
  };
};

export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("User not found");

  const { otp, otpExpires } = generateOtp();
  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  await sendEmail(
    email,
    "Password Reset OTP",
    `Hi ${user.firstName},\n\nYour OTP for password reset is: ${otp}\nIt expires in 3 minutes.\n\nThank you!`
  );

  return {
    success: true,
    message: "Password reset OTP sent to your email.",
  };
};

export const resetPasswordService = async ({ email, otp, newPassword }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("User not found");
  if (user.otp !== otp) throw new Error("Invalid OTP");
  if (Date.now() > user.otpExpires) throw new Error("OTP expired");

  user.password = newPassword;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  return {
    success: true,
    message: "Password reset successfully",
  };
};

export const getProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password -otp -otpExpires");
  if (!user) throw new Error("User not found");

  return {
    success: true,
    user,
  };
};
