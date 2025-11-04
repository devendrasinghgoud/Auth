import Order from "../../models/Order.js";
import nodemailer from "nodemailer";

export const createOrder = async (req, res) => {
  try {
    const { items = [] } = req.body || {};

    if (!items.length) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item.",
      });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated. Please log in.",
      });
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      userId: req.user._id,
      items,
      totalAmount,
      status: "Pending",
    });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email service not configured properly.",
      });
    }

    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const orderItemsHTML = items
      .map(
        (item) =>
          `<li>${item.name} (x${item.quantity}) — ₹${item.price * item.quantity}</li>`
      )
      .join("");

    const mailOptions = {
      from: `"Shop Support" <${process.env.EMAIL_USER}>`,
      to: req.user.email,
      subject: "Order Confirmation — Your Order Has Been Placed!",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Hi ${req.user.firstName || "Customer"},</h2>
          <p>Thank you for your order!</p>
          <p>Your order has been placed successfully and is now being processed.</p>
          <hr />
          <p><strong>Order Summary:</strong></p>
          <ul>${orderItemsHTML}</ul>
          <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <hr />
          <p>We’ll notify you once your order is shipped!</p>
          <p>— The Support Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully and confirmation email sent.",
      order,
    });
  } catch (error) {
    console.error("ORDER CREATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
	