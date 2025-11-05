import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price must be greater than 0"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    unavailableReason: {
      type: String,
      trim: true,
      default: "",
    },
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Product must be associated with a user"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for search
productSchema.index({ name: "text", description: "text", category: "text" });

// Virtual field for frontend use
productSchema.virtual("isAvailable").get(function () {
  // Product is available if active and stock > 0 OR marked as backorder allowed
  return this.isActive && this.stock > 0 && !this.unavailableReason;
});

// Pre-save hook to auto-update isActive & unavailableReason based on stock
productSchema.pre("save", function (next) {
  if (this.stock <= 0) {
    this.isActive = false;
    if (!this.unavailableReason) {
      this.unavailableReason = "Out of stock";
    }
  } else {
    this.isActive = true;
    this.unavailableReason = "";
  }
  next();
});

// Helper method for server-side availability check
// Supports optional backorder
productSchema.methods.checkAvailability = function (quantity = 1, allowBackorder = false) {
  if (!this.isActive && !allowBackorder) {
    throw new Error(`Product "${this.name}" is currently unavailable.`);
  }
  if (this.stock < quantity && !allowBackorder) {
    throw new Error(`Insufficient stock for "${this.name}". Only ${this.stock} left.`);
  }
  return true;
};

const Product = mongoose.model("Product", productSchema);

export default Product;
