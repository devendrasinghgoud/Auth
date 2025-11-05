import { createOrderService, getAllOrdersService } from "./order.service.js";

export const createOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items provided for the order." });
    }

    const order = await createOrderService(req.user, items);

    res.status(201).json({
      success: true,
      message: "Order placed successfully and confirmation email sent.",
      order,
    });
  } catch (error) {
    console.error("ORDER CREATION ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await getAllOrdersService();
    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("GET ALL ORDERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve orders",
    });
  }
};
