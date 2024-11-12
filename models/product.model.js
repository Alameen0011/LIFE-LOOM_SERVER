import mongoose from "mongoose";

const productSchema = new mongoose.Schema({


  productName: {
    type: String,
    required: [true, "Product name is required"],
    unique: true,
    trim: true,
    minLength: [3, "Product name must be at least 3 characters long"],
    maxLength: [50, "Product name must not exceed 50 characters"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    minLength: [10, "Description must be at least 10 characters long"],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categorie",//refrence to category collection
    required: [true, "Category is required"]
  },

  gender: {
    type: String,
    enum: ["Male", "Female", "Kids", "Unisex"],
    required: [true, "Gender category is required"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price must be a positive number"],
  },
  brand: {
    type: String,
    required: [true, "brand is required"],
    unique: true,
  },
  totalStock: {
    type: Number,
    required: true,
},
  sizes: [
    {
      size: { type: String, required: true },
      stock: { type: Number, required: true, min: 0 },
    }
  ],
  images: {
    type: [String], // array of image URLs
    required: [true, "At least 3 product image is required"],
    validate: {
      validator: function (value) {
        return value.every(url => /^(https?:\/\/)[\w.-]+\.[a-zA-Z]{2,}\/?.*$/.test(url));
      },
      message: "Each image must be a valid URL",
    },
  },
  sku: {
    type: String,
    required: [true, "SKU is required"],
    unique: true,
  },
  deleted: { type: Boolean, default: false }, 
  maxPerUser: { type: Number, default: 5 },
  status: {
    type: Boolean,
    default: true, // True means active, false means inactive
  },
}, { timestamps: true });

const Product = mongoose.model('product', productSchema);

export default Product
