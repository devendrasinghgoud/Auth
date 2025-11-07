import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
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
    original_price: {
      type: Number,
      required: [true, "Original price is required"],
      min: [0, "Original price cannot be negative"],
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
      },
    ],
    trending: {
      type: Boolean,
      default: false,
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Product must be associated with a Admin"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Discounted price based on discountPercentage
productSchema.virtual("discountedPrice").get(function () {
  if (this.original_price > 0 && this.discountPercentage > 0) {
    return this.original_price - (this.original_price * this.discountPercentage) / 100;
  }
  return this.price;
});

// Virtual: Product availability
productSchema.virtual("isAvailable").get(function () {
  return this.isActive && this.stockQuantity > 0 && !this.unavailableReason;
});

// Text index for search (cannot index ObjectId fields)
productSchema.index({
  title: "text",
  description: "text",
  brand: "text",
});

// Pre-save hook: Auto-update stock and status
productSchema.pre("save", function (next) {
  this.inStock = this.stockQuantity > 0;

  if (!this.inStock) {
    this.isActive = false;
    if (!this.unavailableReason) this.unavailableReason = "Out of stock";
  } else {
    this.isActive = true;
    this.unavailableReason = "";
  }

  next();
});

// Method: Validate availability before purchase or cart action
productSchema.methods.checkAvailability = function (quantity = 1, allowBackorder = false) {
  if (!this.isActive && !allowBackorder) {
    throw new Error(`Product "${this.title}" is currently unavailable.`);
  }
  if (this.stockQuantity < quantity && !allowBackorder) {
    throw new Error(`Insufficient stock for "${this.title}". Only ${this.stockQuantity} left.`);
  }
  return true;
};

const Product = mongoose.model("Product", productSchema);
export default Product;
