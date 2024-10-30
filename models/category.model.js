import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minLength: [10, "Description must be at least 10 characters long"], // Optional: add minLength validation
  },
  deleted: { type: Boolean, default: false }, 
  status: {
    type: Boolean,
    default: true,
  },

},{timestamps:true});

const Category = mongoose.model("categorie", categorySchema);

export default Category;