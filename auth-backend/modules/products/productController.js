import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
} from "./product.service.js";

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
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await getAllProductsService();
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Fetch all products failed:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await getProductByIdService(req.params.id);
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Fetch product by ID failed:", error);
    res.status(404).json({ success: false, message: error.message });
  }
};

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
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await deleteProductService(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Product and its images deleted" });
  } catch (error) {
    console.error("Product deletion failed:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
