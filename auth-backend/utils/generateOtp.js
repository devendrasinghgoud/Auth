export const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 3 * 60 * 1000; 
  return { otp, otpExpires };
};
