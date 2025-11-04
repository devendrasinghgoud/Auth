import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createOrder } from "../modules/orders/order.controller.js";

const router = express.Router();

router.post("/", protect, createOrder);

export default router;
