import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
} from "./product.service.js";

/**
 * Create a new product
 */
export const createProduct = async (req, res) => {
  try {
    const product = await createProductService(req.user, req.body, req.files);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Product creation failed:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

/**
 * Get all products with pagination, search, and sorting
 */
export const getAllProducts = async (req, res) => {
  try {
    const data = await getAllProductsService(req.query);
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      ...data,
    });
  } catch (error) {
    console.error("Fetch all products failed:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve products",
    });
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (req, res) => {
  try {
    const product = await getProductByIdService(req.params.id);
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Fetch product by ID failed:", error);
    const status = error.name === "CastError" ? 400 : 404;
    res.status(status).json({
      success: false,
      message:
        error.name === "CastError"
          ? "Invalid product ID format"
          : error.message || "Product not found",
    });
  }
};

/**
 * Update a product
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await updateProductService(
      req.params.id,
      req.body,
      req.files,
      req.user
    );
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Product update failed:", error);
    const status = error.name === "CastError" ? 400 : 400;
    res.status(status).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

/**
 * Delete a product along with its images
 */
export const deleteProduct = async (req, res) => {
  try {
    await deleteProductService(req.params.id);
    res.status(200).json({
      success: true,
      message: "Product and its images deleted successfully",
    });
  } catch (error) {
    console.error("Product deletion failed:", error);
    const status = error.name === "CastError" ? 400 : 404;
    res.status(status).json({
      success: false,
      message:
        error.name === "CastError"
          ? "Invalid product ID format"
          : error.message || "Failed to delete product",
    });
  }
};
