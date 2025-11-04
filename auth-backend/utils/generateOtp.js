export const generateOtp = () => ({
  otp: Math.floor(100000 + Math.random() * 900000).toString(),
  otpExpires: Date.now() + 3 * 60 * 1000,
});
