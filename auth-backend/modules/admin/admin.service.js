import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../../models/Admin.js";
import User from "../../models/User.js";

const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_SECRET || "defaultsecret",
    { expiresIn: "7d" }
  );
};

export const registerAdminService = async (data) => {
  const { firstName, lastName, email, phone, password } = data;
  if (!firstName || !lastName || !email || !phone || !password) {
    throw new Error("All fields are required");
  }
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new Error("Admin already exists");
  }
  const admin = new Admin({
    firstName,
    lastName,
    email,
    phone,
    password,
    role: "admin",
  });
  await admin.save();
  return admin;
};

export const loginAdminService = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  const admin = await Admin.findOne({ email });
  if (!admin) throw new Error("Admin not found");
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw new Error("Invalid credentials");
  const token = generateToken(admin);
  return { admin, token };
};

export const getAllUsersService = async (query) => {
  const { page = 1, limit = 10, search = "", sort = "newest" } = query;

  const filter = search
    ? {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const sortOrder = sort === "oldest" ? 1 : -1;

  const totalUsers = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select("-password -otp -otpExpires")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: sortOrder });

  return {
    users,
    totalUsers,
    totalPages: Math.ceil(totalUsers / limit),
    currentPage: Number(page),
  };
};

export const deleteUserService = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new Error("User not found");
  return true;
};
