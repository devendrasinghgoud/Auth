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
      return res.status(400).json({
        success: false,
        message: "At least one product image is required.",
      });
    }

    const result = await createProductService(req.user, req.body, req.files);

    res.status(201).json({
      success: true,
      message: result.message,
      product: result.result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const data = await getAllProductsService(req.query);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve products",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const result = await getProductByIdService(req.params.id);
    res.status(200).json(result);
  } catch (error) {
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

export const updateProduct = async (req, res) => {
  try {
    const result = await updateProductService(req.params.id, req.body, req.files);
    res.status(200).json({
      success: true,
      message: result.message,
      product: result.result,
    });
  } catch (error) {
    const status = error.name === "CastError" ? 400 : 404;
    res.status(status).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const result = await deleteProductService(req.params.id);
    res.status(200).json(result);
  } catch (error) {
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
