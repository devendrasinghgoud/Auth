import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = "8d";


export const generateToken = (user) => {
  if (!user || !user._id) {
    throw new Error("Invalid user data for token generation");
  }

  return jwt.sign(
    { id: user._id, email: user.email }, 
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};
