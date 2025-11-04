import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import { registerValidation, loginValidation } from "../validation/authValidation.js";

export const registerUser = async (userData) => {

  const { error } = registerValidation(userData);
  if (error) throw { status: 400, message: error.details[0].message };

  const { name, email, phone, password } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw { status: 400, message: "Email already registered" };

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
  });

  const token = generateToken(user);
  return { user, token };
};

export const loginUser = async (userData) => {
  const { error } = loginValidation(userData);
  if (error) throw { status: 400, message: error.details[0].message };

  const { email, password } = userData;

  const user = await User.findOne({ email });
  if (!user) throw { status: 404, message: "User not found" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 400, message: "Invalid credentials" };

  const token = generateToken(user);
  return { user, token };
};
