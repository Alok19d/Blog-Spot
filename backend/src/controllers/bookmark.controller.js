import { z } from 'zod';
import BookmarkModel from "../models/bookmark.model.js";

export const bookmarks = async (req, res) => {
  try {
    const posts = await BookmarkModel.find({
      userId: req.userId,
    }).select('postId -_id');

    const postIds = posts.map(item => item.postId.toString());
    
    res
    .status(200)
    .json({
      success: true,
      data:{
        posts: postIds
      },
      message: 'Bookmarks fetched successfully.'
    });
  } catch (error) {
      res
    .status(500)
    .json({
      success: false,
      message: "Server error: Unable to fetch bookmarks",
      error: error
    });
  }
}

export const fetchBookmarkedStatus = async(req, res) => {
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

    /* Fetching Bookmark Status */
    const bookmarkExists = await BookmarkModel.findOne({
      userId: req.userId,
      postId
    });

    res
    .status(200)
    .json({
      success: true,
      data:{
        isBookmarked: bookmarkExists ? true : false
      },
      message: 'Post bookmark fetched successfully.'
    });
  } catch (error) {
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Unable to fetch bookmark status.",
      error: error
    });
  }
}

export const toggleBookmark = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const bookmarkSchema = z.object({
      postId: z.string()
    });
    
    /* Input Validation */
    const validateInput = bookmarkSchema.parse({
      postId
    });

    /* Checking if Post is already Bookmarked */
    const bookmarkExists = await BookmarkModel.findOne({
      userId: req.userId,
      postId
    });

    if(bookmarkExists){
      await BookmarkModel.findByIdAndDelete(bookmarkExists._id);

      res
      .status(200)
      .json({
        success: true,
        data:{
          bookmarked: false
        },
        message: 'Post bookmark toggled successfully.'
      })
      return;
    }

    const bookmark = await BookmarkModel.create({
      userId: req.userId,
      postId
    });

    res
    .status(200)
    .json({
      success: true,
      data:{
        isBookmarked: true
      },
      message: 'Post bookmark toggled successfully.'
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
      message: "Server error: Unable to toggle bookmark.",
      error: error
    });
  }
}