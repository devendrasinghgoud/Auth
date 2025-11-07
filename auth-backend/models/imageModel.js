import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, "Filename is required"],
      trim: true,
    },
    url: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    public_id: {
      type: String,
      required: [true, "Cloudinary public_id is required"],
      trim: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false, // optional, can link to a product later
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // optional, can link to uploader
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Optional: text index for searching images by filename
imageSchema.index({ filename: "text" });

const Image = mongoose.model("Image", imageSchema);

export default Image;
