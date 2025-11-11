import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";
import logger from "../../utils/logger.js";

const populateCartProducts = async (cart) => {
  await cart.populate({
    path: "items.product",
    select: "name price images stock isActive",
  });
  cart.items = cart.items.filter((item) => item.product != null);
  await cart.save();
  return cart;
};

export const getCartByUserService = async (userId) => {
  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
      logger.info(`New cart created for user ${userId}`);
    } else {
      logger.info(`Cart fetched for user ${userId}`);
    }
    return { success: true, cart: await populateCartProducts(cart) };
  } catch (error) {
    logger.error(`Error fetching cart for user ${userId}: ${error.message}`);
    throw error;
  }
};

export const addToCartService = async (userId, productId, quantity = 1) => {
  try {
    productId = productId.trim();
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");
    if (quantity > product.stock) {
      throw new Error(`Only ${product.stock} units of ${product.name} are available`);
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [{ product: productId, quantity }] });
      logger.info(`Cart created and product ${productId} added for user ${userId}`);
      return { success: true, cart: await populateCartProducts(cart) };
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + quantity;
      cart.items[itemIndex].quantity = Math.min(newQty, product.stock);
      logger.info(`Updated quantity for product ${productId} in user ${userId}'s cart`);
    } else {
      cart.items.push({ product: productId, quantity });
      logger.info(`Product ${productId} added to user ${userId}'s cart`);
    }

    await cart.save();
    return { success: true, cart: await populateCartProducts(cart) };
  } catch (error) {
    logger.error(`Error adding product ${productId} to cart for user ${userId}: ${error.message}`);
    throw error;
  }
};

export const removeFromCartService = async (userId, productId) => {
  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error("Cart not found");

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();
    logger.info(`Product ${productId} removed from user ${userId}'s cart`);
    return { success: true, cart: await populateCartProducts(cart) };
  } catch (error) {
    logger.error(`Error removing product ${productId} from cart for user ${userId}: ${error.message}`);
    throw error;
  }
};

export const updateCartItemService = async (userId, productId, quantity) => {
  try {
    if (quantity < 1) throw new Error("Quantity must be at least 1");

    productId = productId.trim();
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");
    if (quantity > product.stock) {
      throw new Error(`Only ${product.stock} units of ${product.name} are available`);
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error("Cart not found");

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex === -1) throw new Error("Product not in cart");

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    logger.info(`Product ${productId} quantity updated to ${quantity} for user ${userId}`);
    return { success: true, cart: await populateCartProducts(cart) };
  } catch (error) {
    logger.error(`Error updating product ${productId} in cart for user ${userId}: ${error.message}`);
    throw error;
  }
};

export const clearCartService = async (userId) => {
  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error("Cart not found");

    cart.items = [];
    await cart.save();
    logger.info(`Cart cleared for user ${userId}`);
    return { success: true, cart };
  } catch (error) {
    logger.error(`Error clearing cart for user ${userId}: ${error.message}`);
    throw error;
  }
};
