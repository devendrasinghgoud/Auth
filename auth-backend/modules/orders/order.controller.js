import {
  createOrderService,
  getAllOrdersService,
  getSingleOrderService,
} from "./order.service.js";
import logger from "../../utils/logger.js";

// ----------------------
// Create Order
// ----------------------
export const createOrder = async (req, res) => {
  logger.info("Create order request received", { userId: req.user?.id });

  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      logger.warn("No items provided for order creation", { userId: req.user?.id });
      return res
        .status(400)
        .json({ success: false, message: "No items provided for the order." });
    }

    const order = await createOrderService(req.user, items);
    logger.info("Order created successfully", { userId: req.user?.id, orderId: order._id });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully and confirmation email sent.",
      order,
    });
  } catch (error) {
    logger.error("Order creation failed", {
      userId: req.user?.id,
      error: error.message,
    });

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ----------------------
// Get All Orders
// ----------------------
export const getAllOrders = async (req, res) => {
  logger.info("Fetching all orders", req.query);

  try {
    const data = await getAllOrdersService(req.query);
    logger.info("Orders fetched successfully", {
      totalOrders: data.totalOrders,
      page: data.currentPage,
    });

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      ...data,
    });
  } catch (error) {
    logger.error("Error fetching all orders", { error: error.message });

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve orders",
    });
  }
};

// ----------------------
// Get Single Order
// ----------------------
export const getSingleOrder = async (req, res) => {
  const { id } = req.params;
  logger.info("Fetching single order", { orderId: id });

  try {
    const order = await getSingleOrderService(id);

    logger.info("Single order fetched successfully", { orderId: id });
    return res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      order,
    });
  } catch (error) {
    logger.error("Error fetching single order", { orderId: id, error: error.message });

    return res.status(404).json({
      success: false,
      message: error.message || "Order not found",
    });
  }
};
