import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart
} from "../modules/cart/cartController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove/:productId", removeFromCart);
router.delete("/clear", clearCart);

export default router;
