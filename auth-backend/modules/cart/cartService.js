import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";

// Helper to populate product details and remove deleted products
const populateCartProducts = async (cart) => {
  await cart.populate({
    path: "items.product",
    select: "name price images stock isActive",
  });

  // Remove items with deleted products
  cart.items = cart.items.filter((item) => item.product != null);
  await cart.save();

  return cart;
};

// Get cart by user
export const getCartByUserService = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return { success: true, cart: await populateCartProducts(cart) };
};

// Add product to cart
export const addToCartService = async (userId, productId, quantity = 1) => {
  productId = productId.trim();
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  if (quantity > product.stock) {
    throw new Error(`Only ${product.stock} units of ${product.name} are available`);
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [{ product: productId, quantity }] });
    return { success: true, cart: await populateCartProducts(cart) };
  }

  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
  if (itemIndex > -1) {
    const newQty = cart.items[itemIndex].quantity + quantity;
    cart.items[itemIndex].quantity = Math.min(newQty, product.stock);
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  return { success: true, cart: await populateCartProducts(cart) };
};

// Remove product from cart
export const removeFromCartService = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error("Cart not found");

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();
  return { success: true, cart: await populateCartProducts(cart) };
};

// Update cart item quantity
export const updateCartItemService = async (userId, productId, quantity) => {
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
  return { success: true, cart: await populateCartProducts(cart) };
};

// Clear cart
export const clearCartService = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error("Cart not found");

  cart.items = [];
  await cart.save();
  return { success: true, cart };
};
