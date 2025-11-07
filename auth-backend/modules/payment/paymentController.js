import { createPaymentIntent } from "./paymentService.js";

export const createPayment = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const multiplier = currency.toLowerCase() === "usd" ? 100 : 100;
    const paymentIntent = await createPaymentIntent(amount * multiplier, currency);
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
