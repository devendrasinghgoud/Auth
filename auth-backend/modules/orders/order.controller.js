import {
  createOrderService,
  getAllOrdersService,
} from "./order.service.js";

export const createOrder = async (req, res) => {
  try {
    const order = await createOrderService(req.user, req.body.items);
    res.status(201).json({
      success: true,
      message: "Order placed successfully and confirmation email sent.",
      order,
    });
  } catch (error) {
    console.error("ORDER CREATION ERROR:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await getAllOrdersService();
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
