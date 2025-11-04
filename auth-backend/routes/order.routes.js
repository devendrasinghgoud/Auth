import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createOrder, getAllOrders } from "../modules/orders/order.controller.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);

router.get("/", protect, isAdmin, getAllOrders);

export default router;
