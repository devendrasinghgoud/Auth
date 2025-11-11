import cloudinary from "../../config/cloudinary.js";
import Image from "../../models/imageModel.js";
import Product from "../../models/Product.js";
import logger from "../../utils/logger.js";

export const uploadImagesService = async (user, productId, files) => {
  try {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const savedImageIds = [];

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "ecommerce_products",
      });

      const image = await Image.create({
        filename: file.originalname,
        url: result.secure_url,
        public_id: result.public_id,
        product: product._id,
        uploadedBy: user?._id || null,
      });

      savedImageIds.push(image._id);
      product.images.push(image._id);
    }

    await product.save();

    logger.info(" Images uploaded successfully", {
      user: user?._id,
      productId,
      count: savedImageIds.length,
    });

    return savedImageIds;
  } catch (error) {
    logger.error(" Error uploading product images", {
      user: user?._id,
      productId,
      error: error.message,
    });
    throw error;
  }
};

export const deleteImageService = async (imageId, user = null) => {
  try {
    const image = await Image.findById(imageId);
    if (!image) throw new Error("Image not found");

    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    if (image.product) {
      await Product.findByIdAndUpdate(image.product, {
        $pull: { images: image._id },
      });
    }

    await image.deleteOne();

    logger.info(" Image deleted successfully", {
      imageId,
      productId: image.product,
      user: user?._id,
    });

    return { success: true };
  } catch (error) {
    logger.error(" Error deleting image", {
      imageId,
      error: error.message,
      user: user?._id,
    });
    throw error;
  }
};

export const updateImageService = async (imageId, file, user = null) => {
  try {
    const image = await Image.findById(imageId);
    if (!image) throw new Error("Image not found");

    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "ecommerce_products",
    });

    image.filename = file.originalname;
    image.url = result.secure_url;
    image.public_id = result.public_id;

    await image.save();

    logger.info(" Image updated successfully", {
      imageId,
      productId: image.product,
      user: user?._id,
    });

    return image;
  } catch (error) {
    logger.error(" Error updating image", {
      imageId,
      error: error.message,
      user: user?._id,
    });
    throw error;
  }
};
