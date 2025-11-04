import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true }, 
    public_id: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);
export default Image;
