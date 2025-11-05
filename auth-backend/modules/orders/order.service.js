import Product from "../../models/Product.js";
import Order from "../../models/Order.js";
import { sendEmail } from "../../utils/sendEmail.js";
import User from "../../models/User.js";

export const createOrderService = async (user, items) => {
  if (!user || !user.id) throw new Error("User information missing in request");

  const orderItems = [];
  const productIds = items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });

  for (const item of items) {
    let product = products.find((p) => p._id.toString() === item.product);
    if (!product) product = await Product.findOne({ name: item.name });
    if (!product) throw new Error(`Product not found: ${item.product || item.name}`);

    try {
      product.checkAvailability(item.quantity);
    } catch (err) {
      throw new Error(err.message);
    }

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
  }

  return order;
};

export const getAllOrdersService = async (query) => {
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

  return {
    orders,
    totalOrders,
    totalPages: Math.ceil(totalOrders / limit),
    currentPage: Number(page),
  };
};
