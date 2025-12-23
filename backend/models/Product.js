import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  category: String,
  images: [String],
  description: String,
  stock: Number
});

export default mongoose.model("Product", productSchema);
