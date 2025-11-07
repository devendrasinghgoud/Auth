import Stripe from "stripe";
import Order from "../../models/Order.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        await Order.findByIdAndUpdate(paymentIntent.metadata.orderId, { status: "paid" });
        break;

      case "payment_intent.payment_failed":
        const failedIntent = event.data.object;
        await Order.findByIdAndUpdate(failedIntent.metadata.orderId, { status: "failed" });
        break;

      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
