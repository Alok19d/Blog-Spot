import { z } from 'zod';
import jwt from 'jsonwebtoken';
import ViewModel from "../models/view.model.js";

export const likes = async (req, res) => {
  try {
    const likedPosts = await ViewModel.find({ likes: req.userId }).select('postId -_id');

    const postIds = likedPosts.map(item => item.postId.toString());

    res
    .status(200)
    .json({
      success: true,
      data: {
        posts: postIds
      },
      message: "Liked Posts fetched successfully.",
    });
  } catch (error) {
    console.log(error);
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Couldn't fetch likes",
      error: error
    });
  }
}

export const fetchViewsAndLikes = async (req, res) => {
  try {
    const { postId } = req.query;
    
    if(!postId){
      res
      .status(400)
      .json({
        success: false,
        message: "Post Id is required."
      });
      return;
    }

    /* Fetching Liked Status */
    const view = await ViewModel.findOne({postId});

    if(!view){
      res
      .status(400)
      .json({
        success: false,
        message: "Invalid Post Id",
      });
    }

    /* If User doesn't Exists */
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
      res
      .status(200)
      .json({
        success: true,
        data:{
          views: view.viewCount,
          likes: view.likeCount,
          isLiked: false
        },
        message: 'Views and Likes fetched successfully.'
      });
      return;
    }

    /* If User Exists */
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_TOKEN_SECRET);

    const userIndex = view.likes.indexOf(decodedToken?.id);

    res
    .status(200)
    .json({
      success: true,
      data:{
        views: view.viewCount,
        likes: view.likeCount,
        isLiked: userIndex !== -1 ? true : false
      },
      message: 'Views and Likes fetched successfully.'
    });
  } catch (error) {
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Couldn't fetch Views and Likes",
      error: error
    });
  }
}

export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;

    const viewSchema = z.object({
      postId: z.string()
    });

    /* Input Validation */
    const validateInput = viewSchema.parse({
      postId
    });

    const view = await ViewModel.findOne({postId});

    if(!view){
      res
      .status(400)
      .json({
        success: false,
        message: "Invalid Post Id",
      });
    }

    const userIndex = view.likes.indexOf(req.userId);

    if(userIndex === -1){
      view.likeCount += 1;
      view.likes.push(req.userId);
    }
    else{
      view.likeCount -= 1;
      view.likes.splice(userIndex, 1);
    }

    await view.save();

    res
    .status(200)
    .json({
      success: true,
      data: {
        isLiked: userIndex !== -1 ? false : true,
        likes: view.likeCount
      },
      message: "Post like toggled successfully.",
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
      message: "Server error: Couldn't like Post",
      error: error
    });
  }
}