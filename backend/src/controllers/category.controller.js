import { z } from 'zod';
import CategoryModel from '../models/category.model.js'
import PostModel from '../models/post.model.js';

export const createCategory = async (req, res) => {
  try {
    const categorySchema = z.object({
      name: z.string(),
      description: z.string()
    });

    const { name, description } = req.body;

    /* Input Validation */
    const validateCategory = categorySchema.parse({
      name,
      description
    });

    /* Check if Category Already Exists */
    const categoryExists = await CategoryModel.findOne({ name });
    if (categoryExists){
      res
      .status(409)
      .json({
        success: false,
        message: "Category Already Exists."
      });
      return;
    }

    const category = await CategoryModel.create({
      name,
      description
    });

    res
    .status(201)
    .json({
      success: true,
      data:{
        category
      },
      message: "Category created successfully!"
    });
  } catch (error) {
    console.log(error);
    if(error instanceof z.ZodError){
      res
      .status(400)
      .json({
        success: false,
        message: error.errors[0]?.message || "Input Validation Error",
        error: error
      });
      return;
    }
    
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Unable to register category at this time.",
      error: error
    });
  }
}

export const getCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find();

    res
    .status(200)
    .json({
      success: true,
      data: {
        categories
      },
      message: "Categories Fetched Successfully"
    });
  } catch (error) {
    res
    .status(500)
    .json({
      success: false,
      error,
      message: "Server error: Unable to fetch categories."
    });
  }
}

export const postCount = async (req, res) => {
  try {
    const counts = await PostModel.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $unwind: "$category"
      },
      {
        $project: {
          _id: 0,
          categoryId: "$category._id",
          categoryName: "$category.name",
          count: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: counts,
      message: "Post count by category fetched successfully."
    });
  } catch (error) {
    res
    .status(500)
    .json({
      success: false,
      error,
      message: "Server error: Unable to fetch post count by category."
    });
  }
}

export const deleteCategory = async (req, res) => {
  try {
    const categoryId  = req.params.categoryId;

    if(!categoryId){
      res
      .status(400)
      .json({
        success: false,
        message: "CategoryId is required."
      });
      return;
    }

    await CategoryModel.findByIdAndDelete(categoryId);

    res
    .status(200)
    .json({
      success: true,
      message: "Category deleted successfully."
    });
  } catch (error) {
    res
    .status(500)
    .json({
      success: false,
      error,
      message: "Server error: Unable to delete category."
    });
  }
}