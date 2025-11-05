import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import { generateOtp } from "../../utils/generateOtp.js";
import { sendEmail } from "../../utils/sendEmail.js";

export const getAllUsers = async () => {
  return await User.find().select("-password -otp -otpExpires");
};

export const getUserById = async (id) => {
  const user = await User.findById(id).select("-password -otp -otpExpires");
  if (!user) throw new Error("User not found");
  return user;
};

export const updateUser = async (id, body) => {
  if (body.password) {
    body.password = await bcrypt.hash(body.password, 10);
  }

  const user = await User.findByIdAndUpdate(id, body, { new: true }).select(
    "-password -otp -otpExpires"
  );

  if (!user) throw new Error("User not found or update failed");
  return user;
};

export const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new Error("User not found or already deleted");
  return true;
};

export const verifyOtp = async ({ email, otp }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (user.isVerified) throw new Error("User already verified");
  if (user.otp !== otp) throw new Error("Invalid OTP");
  if (Date.now() > user.otpExpires) throw new Error("OTP expired");

  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  return { message: "Email verified successfully" };
};

export const resendOtp = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const { otp, otpExpires } = generateOtp();
  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  await sendEmail(
    email,
    "Resend OTP - Email Verification",
    `Hi ${user.name},\n\nYour new OTP for verification is: ${otp}\nIt expires in 3 minutes.\n\nThank you!`
  );

  return { message: "New OTP sent successfully to your email" };
};

export const forgotPassword = async ({ email }) => {
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

  return { message: "Password reset OTP sent successfully to your email" };
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (user.otp !== otp) throw new Error("Invalid OTP");
  if (Date.now() > user.otpExpires) throw new Error("OTP expired");

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  return { message: "Password has been reset successfully" };
};
