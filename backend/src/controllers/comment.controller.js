import z from 'zod';
import CommentModel from '../models/comment.model.js'
import mongoose from 'mongoose';

export const createComment = async (req, res) => {
  try{
    const commentSchema = z.object({
      postId: z.string(),
      parentCommentId: z.string().optional(),
      content: z.string(),
    })

    const { postId, parentCommentId, content } = req.body;

    /* Input Validation */
    const validateInput = commentSchema.parse({
      postId,
      parentCommentId,
      content
    })

    /* Creating Comment */
    const comment = await CommentModel
    .create({
      userId: req.userId,
      postId,
      ... (parentCommentId) && {parentCommentId},
      content
    })

    const createdComment = await CommentModel
    .findById(comment._id)
    .populate('userId', 'fullname profileImg');

      const responseComment = {
      _id: createdComment._id,
      content: createdComment.content,
      user: {
        _id: createdComment.userId._id,
        fullname: createdComment.userId.fullname,
        profileImg: createdComment.userId.profileImg,
      },
      replyCount: 0,
      likeCount: createComment.likeCount,
      createdAt: createdComment.createdAt,
    };

    res
    .status(200)
    .json({
      success: true,
      data:{
        comment: responseComment
      },
      message: "Comment Created successfully."
    });
  } catch(error){
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
      message: "Something went wrong while creating Comment!",
      error: error
    });
  }
}

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 5;

    const comments = await CommentModel.aggregate([
      // Match parent comments for the specific post
      {
        $match: {
          postId: new mongoose.Types.ObjectId(postId),
          parentCommentId: null
        }
      },
      // Sort by creation date (newest first)
      {
        $sort: { createdAt: -1 }
      },
      // Skip and limit for pagination
      {
        $skip: startIndex
      },
      {
        $limit: limit
      },
      // Lookup user information
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            {
              $project: {
                fullname: 1,
                profileImg: 1
              }
            }
          ]
        }
      },
      // Lookup reply count
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'parentCommentId',
          as: 'replies'
        }
      },
      // Project the final structure
      {
        $project: {
          content: 1,
          likeCount: 1,
          createdAt: 1,
          user: { $arrayElemAt: ['$user', 0] },
          replyCount: { $size: '$replies' }
        }
      }
    ]);

    const totalComments = await CommentModel.countDocuments({
      postId,
      parentCommentId: null
    });

    res.status(200).json({
      success: true,
      data: {
        comments,
        totalComments
      },
      message: "Comments fetched successfully."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching comments!",
      error: error.message
    });
  }
};

export const getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;

    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 5;

    const comments = await CommentModel.aggregate([
      {
        $match: {
          parentCommentId: new mongoose.Types.ObjectId(commentId),
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $skip: startIndex
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            {
              $project: {
                fullname: 1,
                profileImg: 1
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'parentCommentId',
          as: 'replies'
        }
      },
      {
        $project: {
          content: 1,
          likeCount: 1,
          createdAt: 1,
          user: { $arrayElemAt: ['$user', 0] },
          replyCount: { $size: '$replies' }
        }
      }
    ]);

    const totalComments = await CommentModel.countDocuments({
      parentCommentId: commentId
    });

    res.status(200).json({
      success: true,
      data: {
        comments,
        totalComments
      },
      message: "Comment replies fetched successfully."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching replies!",
      error: error.message
    });
  }
}

export const likedComments = async (req, res) => {
  try {
    const { postId } = req.params;

    if(!postId){
      res
      .status(400)
      .json({
        success: false,
        message: "Post Id is required",
      });
      return;
    }

    const likedComments = await CommentModel.find({
      likes: req.userId
    }).select('_id');

    const commentIds = likedComments.map(item => item._id.toString());

    res
    .status(200)
    .json({
      success: true,
      data: {
        comments: commentIds
      },
      message: "Liked Comments fetched successfully.",
    });
  } catch (error) {
    console.log(error);
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Couldn't fetch liked comments",
      error: error
    });
  }
}

export const toggleLike = async(req, res) => {
  try {
    const comment = await CommentModel.findById(req.params.commentId);
    
    if(!comment){
      res
      .status(400)
      .json({
        success: false,
        message: "Comment Not Found",
      });
    }

    const userIndex = comment.likes.indexOf(req.userId);

    if(userIndex === -1){
      comment.likeCount += 1;
      comment.likes.push(req.userId);
    }
    else{
      comment.likeCount -= 1;
      comment.likes.splice(userIndex, 1);
    }

    await comment.save();
    
    res
    .status(200)
    .json({
      success: true,
      data:{
        isLiked: userIndex === -1 ? true : false,
        likeCount: comment.likeCount
      },
      message: "Comment like toggled Successfully",
    });
  } catch (error) {
    res
    .status(500)
    .json({
      success: false,
      message: "Something went wrong while toggling comment likes!",
      error: error
    });
  }
}

export const editComment = async (req, res) => {
  try {
    const editSchema = z.object({
      content: z.string()
    })

    const { content } = req.body;

    /* Input Validation */
    const validateInput = editSchema.parse({
      content
    });

    const comment = await CommentModel.findOneAndUpdate(
      {
      _id: req.params.commentId,
      userId: req.userId
      },
      {
        content
      }
    );
    
    if(!comment){
      res
      .status(400)
      .json({
        success: false,
        message: "Comment Not Found",
      });
    }

    res
    .status(200)
    .json({
      success: true,
      message: "Comment edited Successfully",
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
      message: "Something went wrong while editing Comment!",
      error: error
    });
  }
}

export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    const comment = await CommentModel.findOne({
      _id: req.params.commentId,
      userId: req.userId
    });
    
    if (!comment) {
      res
      .status(404)
      .json({
        success: false,
        message: "Comment not Found."
      });
      return;
    }

    async function deleteCommentWithReplies(id) {
      const replies = await CommentModel.find({ parentCommentId: id });

      for (const reply of replies) {
        await deleteCommentWithReplies(reply._id);
      }

      await CommentModel.findByIdAndDelete(id);
    }

    await deleteCommentWithReplies(commentId);

    res
    .status(200)
    .json({
      success: true,
      message: "Comment and all nested replies deleted successfully.",
    });
  } catch (error) {
    res
    .status(500)
    .json({
      success: false,
      message: "Something went wrong while deleting Comment!",
      error: error
    });
  }
}