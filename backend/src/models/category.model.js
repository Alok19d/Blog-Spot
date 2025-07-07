import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true, 
  }
})

const CategoryModel = mongoose.model('Category',categorySchema);

export default CategoryModel;