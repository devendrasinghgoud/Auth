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
import logger from "../../utils/logger.js";

export const registerAdmin = async (req, res) => {
  try {
    const admin = await registerAdminService(req.body);
    logger.info(`Admin registered: ${admin.email}`);
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
    logger.error(`Register Admin Error: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { admin, token } = await loginAdminService(req.body.email, req.body.password);
    logger.info(`Admin logged in: ${admin.email}`);
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
    logger.error(`Login Admin Error: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { users, totalUsers, totalPages, currentPage } = await getAllUsersService(req.query);
    logger.info(`Fetched ${users.length} users`);
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
      count: totalUsers,
      totalPages,
      currentPage,
    });
  } catch (error) {
    logger.error(`Get All Users Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await deleteUserService(req.params.id);
    logger.info(`User deleted: ${req.params.id}`);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    logger.error(`Delete User Error: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { products, totalProducts, totalPages, currentPage } = await getAllProductsService(req.query);
    logger.info(`Fetched ${products.length} products`);
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
      count: totalProducts,
      totalPages,
      currentPage,
    });
  } catch (error) {
    logger.error(`Get All Products Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await deleteProductService(req.params.id);
    logger.info(`Product deleted: ${req.params.id}`);
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    logger.error(`Delete Product Error: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { orders, totalOrders, totalPages, currentPage } = await getAllOrdersService(req.query);
    logger.info(`Fetched ${orders.length} orders`);
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders,
      count: totalOrders,
      totalPages,
      currentPage,
    });
  } catch (error) {
    logger.error(`Get All Orders Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrdersByUserId = async (req, res) => {
  try {
    const orders = await getOrdersByUserIdService(req.params.userId);
    logger.info(`Fetched ${orders.length} orders for user: ${req.params.userId}`);
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully for user",
      orders,
      count: orders.length,
    });
  } catch (error) {
    logger.error(`Get Orders By UserId Error: ${error.message}`);
    res.status(404).json({ success: false, message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    await deleteOrderService(req.params.id);
    logger.info(`Order deleted: ${req.params.id}`);
    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    logger.error(`Delete Order Error: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};
