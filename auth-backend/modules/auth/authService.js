import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import sendEmail from "../../utils/sendEmail.js";
import { generateToken } from "../../utils/generateToken.js";
import { generateOtp } from "../../utils/generateOtp.js";

export const registerUserService = async ({ name, username, email, phone, password }) => {
  if (!name || !username || !email || !phone || !password) {
    throw new Error("All fields are required");
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
    throw new Error(`${field} already registered`);
  }

  const { otp, otpExpires } = generateOtp();

  const user = await User.create({
    name,
    username,
    email: email.toLowerCase(),
    phone,
    password, // hashed via model pre-save hook
    otp,
    otpExpires,
  });

  await sendEmail(
    email,
    "Verify Your Email - OTP",
    `Hi ${name},\n\nYour OTP for verification is: ${otp}\nIt expires in 3 minutes.\n\nThank you!`
  );

  return user;
};

export const verifyOtpService = async ({ email, otp }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("User already verified");
  if (user.otp !== otp) throw new Error("Invalid OTP");
  if (Date.now() > user.otpExpires) throw new Error("OTP expired");

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  const token = generateToken(user);
  return { token, user };
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
  return { token, user };
};

export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const { otp, otpExpires } = generateOtp();
  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  await sendEmail(
    email,
    "Password Reset OTP",
    `Hi ${user.name},\n\nYour OTP for password reset is: ${otp}\nIt expires in 3 minutes.\n\nThank you!`
  );

  return true;
};

export const resetPasswordService = async ({ email, otp, newPassword }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  if (user.otp !== otp) throw new Error("Invalid OTP");
  if (Date.now() > user.otpExpires) throw new Error("OTP expired");

  user.password = newPassword;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  return true;
};

export const getProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password -otp -otpExpires");
  if (!user) throw new Error("User not found");
  return user;
};
