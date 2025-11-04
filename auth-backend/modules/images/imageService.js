import fs from "fs";
import Image from "../../models/imageModel.js";
import Product from "../../models/Product.js";

export const uploadImagesService = async (user, productId, files) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  if (!files || files.length === 0) throw new Error("No files uploaded");

  const imageDocs = await Promise.all(
    files.map(async (file) => {
      const image = await Image.create({
        filename: file.filename,
        path: file.path,
        product: productId,
        uploadedBy: user._id,
      });
      return image._id;
    })
  );

  product.images.push(...imageDocs);
  await product.save();

  return imageDocs;
};

export const deleteImageService = async (imageId) => {
  const image = await Image.findById(imageId);
  if (!image) throw new Error("Image not found");

  if (fs.existsSync(image.path)) fs.unlinkSync(image.path);

  await Product.findByIdAndUpdate(image.product, {
    $pull: { images: imageId },
  });

  await image.deleteOne();

  return true;
};

export const updateImageService = async (imageId, file) => {
  const image = await Image.findById(imageId);
  if (!image) throw new Error("Image not found");
  if (!file) throw new Error("No new image uploaded");

  if (fs.existsSync(image.path)) fs.unlinkSync(image.path);

  image.filename = file.filename;
  image.path = file.path;
  await image.save();

  return image;
};
