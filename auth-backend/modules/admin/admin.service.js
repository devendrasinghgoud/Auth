import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../../models/Admin.js";
import User from "../../models/User.js";
import Product from "../../models/Product.js";
import Order from "../../models/Order.js";
import Logger from "../../utils/logger.js";

const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_SECRET || "defaultsecret",
    { expiresIn: "7d" }
  );
};

export const registerAdminService = async (data) => {
  try {
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
    Logger.info("Admin registered successfully", { adminId: admin._id });
    return admin;
  } catch (error) {
    Logger.error("Error in registerAdminService", { message: error.message, stack: error.stack });
    throw error;
  }
};

export const loginAdminService = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const admin = await Admin.findOne({ email });
    if (!admin) throw new Error("Admin not found");
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error("Invalid credentials");
    const token = generateToken(admin);
    Logger.info("Admin logged in successfully", { adminId: admin._id });
    return { admin, token };
  } catch (error) {
    Logger.error("Error in loginAdminService", { message: error.message, stack: error.stack });
    throw error;
  }
};

export const getAllUsersService = async (query) => {
  try {
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
    Logger.info("Fetched users list", { total: totalUsers });
    return {
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: Number(page),
    };
  } catch (error) {
    Logger.error("Error in getAllUsersService", { message: error.message });
    throw error;
  }
};

export const deleteUserService = async (id) => {
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new Error("User not found");
    await Order.deleteMany({ userId: id });
    Logger.info("User deleted successfully", { userId: id });
    return true;
  } catch (error) {
    Logger.error("Error in deleteUserService", { message: error.message });
    throw error;
  }
};

export const getAllProductsService = async (query) => {
  try {
    const { page = 1, limit = 10, search = "", sort = "newest" } = query;
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const sortOrder = sort === "oldest" ? 1 : -1;
    const totalProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("category")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: sortOrder });
    Logger.info("Fetched products list", { total: totalProducts });
    return {
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: Number(page),
    };
  } catch (error) {
    Logger.error("Error in getAllProductsService", { message: error.message });
    throw error;
  }
};

export const deleteProductService = async (id) => {
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) throw new Error("Product not found");
    Logger.info("Product deleted successfully", { productId: id });
    return true;
  } catch (error) {
    Logger.error("Error in deleteProductService", { message: error.message });
    throw error;
  }
};

export const getAllOrdersService = async (query) => {
  try {
    const { page = 1, limit = 10, sort = "newest" } = query;
    const sortOrder = sort === "oldest" ? 1 : -1;
    const totalOrders = await Order.countDocuments({});
    const orders = await Order.find({})
      .populate("userId", "firstName lastName email")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: sortOrder });
    Logger.info("Fetched all orders", { total: totalOrders });
    return {
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: Number(page),
    };
  } catch (error) {
    Logger.error("Error in getAllOrdersService", { message: error.message });
    throw error;
  }
};

export const getOrdersByUserIdService = async (userId) => {
  try {
    const orders = await Order.find({ userId })
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 });
    if (!orders || orders.length === 0) {
      throw new Error("No orders found for this user");
    }
    Logger.info("Fetched orders for user", { userId, count: orders.length });
    return orders;
  } catch (error) {
    Logger.error("Error in getOrdersByUserIdService", { message: error.message });
    throw error;
  }
};

export const deleteOrderService = async (id) => {
  try {
    const order = await Order.findByIdAndDelete(id);
    if (!order) throw new Error("Order not found");
    Logger.info("Order deleted successfully", { orderId: id });
    return true;
  } catch (error) {
    Logger.error("Error in deleteOrderService", { message: error.message });
    throw error;
  }
};
