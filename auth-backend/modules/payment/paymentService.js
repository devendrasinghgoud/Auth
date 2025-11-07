import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (amount, currency = "usd") => {
  try {
    const supportedCurrencies = ["usd", "inr"];
    if (!supportedCurrencies.includes(currency.toLowerCase())) {
      throw new Error("Currency not supported");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    throw new Error(error.message);
  }
};
