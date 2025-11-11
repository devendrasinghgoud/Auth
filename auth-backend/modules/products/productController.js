import logger from "../../utils/logger.js";
import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
} from "./product.service.js";

export const createProduct = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      logger.warn("Attempted to create product without images", {
        user: req.user?._id,
      });
      return res.status(400).json({
        success: false,
        message: "At least one product image is required.",
      });
    }

    const result = await createProductService(req.user, req.body, req.files);

    logger.info("Product created successfully", {
      user: req.user?._id,
      productId: result.result?._id,
    });

    res.status(201).json({
      success: true,
      message: result.message,
      product: result.result,
    });
  } catch (error) {
    logger.error("Error creating product", {
      error: error.message,
      stack: error.stack,
      user: req.user?._id,
    });
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const data = await getAllProductsService(req.query);
    logger.info("Fetched all products successfully", { query: req.query });
    res.status(200).json(data);
  } catch (error) {
    logger.error("Failed to fetch products", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve products",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const result = await getProductByIdService(req.params.id);
    logger.info("Fetched product by ID", { productId: req.params.id });
    res.status(200).json(result);
  } catch (error) {
    const status = error.name === "CastError" ? 400 : 404;
    logger.warn("Failed to get product by ID", {
      productId: req.params.id,
      error: error.message,
      status,
    });
    res.status(status).json({
      success: false,
      message:
        error.name === "CastError"
          ? "Invalid product ID format"
          : error.message || "Product not found",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const result = await updateProductService(req.params.id, req.body, req.files);
    logger.info("Product updated successfully", { productId: req.params.id });
    res.status(200).json({
      success: true,
      message: result.message,
      product: result.result,
    });
  } catch (error) {
    const status = error.name === "CastError" ? 400 : 404;
    logger.error("Failed to update product", {
      productId: req.params.id,
      error: error.message,
      stack: error.stack,
      status,
    });
    res.status(status).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const result = await deleteProductService(req.params.id);
    logger.info("Product deleted successfully", { productId: req.params.id });
    res.status(200).json(result);
  } catch (error) {
    const status = error.name === "CastError" ? 400 : 404;
    logger.error("Failed to delete product", {
      productId: req.params.id,
      error: error.message,
      stack: error.stack,
      status,
    });
    res.status(status).json({
      success: false,
      message:
        error.name === "CastError"
          ? "Invalid product ID format"
          : error.message || "Failed to delete product",
    });
  }
};
