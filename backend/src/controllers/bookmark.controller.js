import { z } from 'zod';
import BookmarkModel from "../models/bookmark.model.js";

export const toggleBookmark = async (req, res) => {
  try {
    const bookmarkSchema = z.object({
      postId: z.string()
    });

    const { postId } = req.body;

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
        bookmarked: true
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