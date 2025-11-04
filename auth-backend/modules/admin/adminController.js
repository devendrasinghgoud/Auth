import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Admin from "../../models/Admin.js";
import User from "../../models/User.js";

dotenv.config();

const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_SECRET || "defaultsecret",
    { expiresIn: "7d" }
  );
};

export const registerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !phone || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res.status(400).json({ success: false, message: "Admin already exists" });

    const admin = new Admin({ firstName, lastName, email, phone, password, role: "admin" });
    await admin.save();

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Register Admin Error:", error);
    res.status(500).json({ success: false, message: "Admin registration failed" });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(404).json({ success: false, message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(admin);

    res.status(200).json({
      success: true,
      message: "Login successful",
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        token,
      },
    });
  } catch (error) {
    console.error("Login Admin Error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp -otpExpires");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};
