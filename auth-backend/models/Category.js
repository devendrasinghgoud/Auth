import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

// Text index for searching categories by name
categorySchema.index({ name: "text" });

const Category = mongoose.model("Category", categorySchema);
export default Category;
