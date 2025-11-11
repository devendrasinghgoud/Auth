import logger from "../../utils/logger.js";
import {
  getCartByUserService,
  addToCartService,
  removeFromCartService,
  updateCartItemService,
  clearCartService
} from "./cartService.js";

// Get current user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await getCartByUserService(req.user._id);
    logger.info(`Cart retrieved successfully for user ${req.user._id}`);
    res.status(200).json({ success: true, cart });
  } catch (error) {
    logger.error(`Error fetching cart for user ${req.user._id}: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add product to cart
export const addToCart = async (req, res) => {
  try {
    let { productId, quantity } = req.body;

    if (!productId) {
      logger.warn("Add to cart failed: Missing product ID");
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    productId = productId.trim();
    quantity = quantity ? Number(quantity) : 1;

    const cart = await addToCartService(req.user._id, productId, quantity);
    logger.info(`Product ${productId} added to cart for user ${req.user._id}`);
    res.status(200).json({ success: true, cart });
  } catch (error) {
    logger.error(`Error adding product to cart: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove product from cart
export const removeFromCart = async (req, res) => {
  try {
    let { productId } = req.params;

    if (!productId) {
      logger.warn("Remove from cart failed: Missing product ID");
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    productId = productId.trim();
    const cart = await removeFromCartService(req.user._id, productId);
    logger.info(`Product ${productId} removed from cart for user ${req.user._id}`);
    res.status(200).json({ success: true, cart });
  } catch (error) {
    logger.error(`Error removing product from cart: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update product quantity in cart
export const updateCartItem = async (req, res) => {
  try {
    let { productId, quantity } = req.body;

    if (!productId || quantity == null) {
      logger.warn("Update cart item failed: Missing product ID or quantity");
      return res.status(400).json({ success: false, message: "Product ID and quantity are required" });
    }

    productId = productId.trim();
    quantity = Number(quantity);

    const cart = await updateCartItemService(req.user._id, productId, quantity);
    logger.info(`Cart updated: Product ${productId} quantity set to ${quantity} for user ${req.user._id}`);
    res.status(200).json({ success: true, cart });
  } catch (error) {
    logger.error(`Error updating cart item for user ${req.user._id}: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear all items from cart
export const clearCart = async (req, res) => {
  try {
    const cart = await clearCartService(req.user._id);
    logger.info(`Cart cleared for user ${req.user._id}`);
    res.status(200).json({ success: true, cart });
  } catch (error) {
    logger.error(`Error clearing cart for user ${req.user._id}: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};
