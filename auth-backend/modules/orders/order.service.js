import Product from "../../models/Product.js";
import Order from "../../models/Order.js";
import User from "../../models/User.js";
import { sendEmail } from "../../utils/sendEmail.js";
import logger from "../../utils/logger.js"; // ✅ Winston logger

// ----------------------
// Create Order
// ----------------------
export const createOrderService = async (user, items) => {
  logger.info("Creating new order...", { userId: user?.id });

  if (!user || !user.id) {
    logger.error("User information missing in request");
    throw new Error("User information missing in request");
  }

  try {
    const orderItems = [];
    const productIds = items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    for (const item of items) {
      let product = products.find((p) => p._id.toString() === item.product);
      if (!product) product = await Product.findOne({ name: item.name });
      if (!product) {
        logger.warn(`Product not found: ${item.product || item.name}`);
        throw new Error(`Product not found: ${item.product || item.name}`);
      }

      product.checkAvailability(item.quantity);
      product.stock -= item.quantity;
      await product.save();

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const order = await Order.create({ userId: user.id, items: orderItems });
    logger.info(`Order created successfully: ${order._id}`, { userId: user.id });

    // Send order confirmation email
    const userData = await User.findById(user.id);
    if (userData?.email) {
      const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const html = `
        <h2>Order Confirmation</h2>
        <p>Hi ${userData.firstName || "Customer"},</p>
        <p>Your order has been placed successfully!</p>
        <h3>Order Details:</h3>
        <ul>
          ${orderItems
            .map(
              (item) =>
                `<li>${item.name} - ${item.quantity} × ₹${item.price} = ₹${
                  item.price * item.quantity
                }</li>`
            )
            .join("")}
        </ul>
        <p><strong>Total:</strong> ₹${total}</p>
        <p>Status: ${order.status}</p>
        <p>Thank you for shopping with us!</p>
      `;
      await sendEmail(userData.email, "Order Confirmation", html);
      logger.info(`Order confirmation email sent to ${userData.email}`);
    }

    return order;
  } catch (error) {
    logger.error("Error creating order", { error: error.message });
    throw error;
  }
};

// ----------------------
// Get All Orders
// ----------------------
export const getAllOrdersService = async (query) => {
  logger.info("Fetching all orders", query);

  try {
    const { page = 1, limit = 10, search = "", sort = "newest" } = query;

    const userFilter = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const matchedUsers = await User.find(userFilter).select("_id");
    const userIds = matchedUsers.map((u) => u._id);
    const orderFilter = userIds.length ? { userId: { $in: userIds } } : {};
    const sortOrder = sort === "oldest" ? 1 : -1;
    const totalOrders = await Order.countDocuments(orderFilter);

    const orders = await Order.find(orderFilter)
      .populate("userId", "firstName lastName email")
      .populate("items.product", "name price stock isActive unavailableReason")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: sortOrder });

    logger.info(`Fetched ${orders.length} orders successfully`);

    return {
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: Number(page),
    };
  } catch (error) {
    logger.error("Error fetching all orders", { error: error.message });
    throw error;
  }
};

// ----------------------
// Get Single Order
// ----------------------
export const getSingleOrderService = async (orderId) => {
  logger.info(`Fetching single order: ${orderId}`);

  try {
    const order = await Order.findById(orderId)
      .populate("userId", "firstName lastName email")
      .populate("items.product", "name price stock");

    if (!order) {
      logger.warn(`Order not found: ${orderId}`);
      throw new Error("Order not found");
    }

    logger.info(`Order fetched successfully: ${orderId}`);
    return order;
  } catch (error) {
    logger.error("Error fetching single order", { error: error.message });
    throw error;
  }
};
