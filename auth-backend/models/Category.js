// models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// removed redundant index — unique already defined above
const Category = mongoose.model("Category", categorySchema);
export default Category;
