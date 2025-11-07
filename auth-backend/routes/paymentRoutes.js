import express from "express";
import { createPayment } from "../modules/payment/paymentController.js";
import { stripeWebhook } from "../modules/payment/paymentWebhook.js";

const router = express.Router();

router.post("/create-payment-intent", createPayment);
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

export default router;
