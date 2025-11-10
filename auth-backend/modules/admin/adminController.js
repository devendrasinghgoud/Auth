import {
  registerAdminService,
  loginAdminService,
  getAllUsersService,
  deleteUserService,
  getAllProductsService,
  deleteProductService,
  getAllOrdersService,
  getOrdersByUserIdService,
  deleteOrderService,
} from "./admin.service.js";

export const registerAdmin = async (req, res) => {
  try {
    const admin = await registerAdminService(req.body);
    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phone: admin.phone,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { admin, token } = await loginAdminService(req.body.email, req.body.password);
    res.status(200).json({
      success: true,
      message: "Login successful",
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phone: admin.phone,
        token,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- User Management ---
export const getAllUsers = async (req, res) => {
  try {
    const { users, totalUsers, totalPages, currentPage } = await getAllUsersService(req.query);
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
      count: totalUsers,
      totalPages,
      currentPage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await deleteUserService(req.params.id);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- Product Management ---
export const getAllProducts = async (req, res) => {
  try {
    const { products, totalProducts, totalPages, currentPage } = await getAllProductsService(req.query);
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
      count: totalProducts,
      totalPages,
      currentPage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await deleteProductService(req.params.id);
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- Order Management ---
export const getAllOrders = async (req, res) => {
  try {
    const { orders, totalOrders, totalPages, currentPage } = await getAllOrdersService(req.query);
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders,
      count: totalOrders,
      totalPages,
      currentPage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrdersByUserId = async (req, res) => {
  try {
    const orders = await getOrdersByUserIdService(req.params.userId);
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully for user",
      orders,
      count: orders.length,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    await deleteOrderService(req.params.id);
    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};