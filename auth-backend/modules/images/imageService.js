import cloudinary from "../../config/cloudinary.js";
import Image from "../../models/imageModel.js";
import Product from "../../models/Product.js";

export const uploadImagesService = async (user, productId, files) => {
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

  return savedImageIds;
};

export const deleteImageService = async (imageId) => {
  const image = await Image.findById(imageId);
  if (!image) throw new Error("Image not found");

  // Remove from Cloudinary
  if (image.public_id) {
    await cloudinary.uploader.destroy(image.public_id);
  }

  // Remove image reference from product
  if (image.product) {
    await Product.findByIdAndUpdate(image.product, {
      $pull: { images: image._id },
    });
  }

  await image.deleteOne();

  return { success: true };
};

export const updateImageService = async (imageId, file) => {
  const image = await Image.findById(imageId);
  if (!image) throw new Error("Image not found");

  // Delete old image from Cloudinary
  if (image.public_id) {
    await cloudinary.uploader.destroy(image.public_id);
  }

  // Upload new image
  const result = await cloudinary.uploader.upload(file.path, {
    folder: "ecommerce_products",
  });

  image.filename = file.originalname;
  image.url = result.secure_url;
  image.public_id = result.public_id;

  await image.save();
  return image;
};
