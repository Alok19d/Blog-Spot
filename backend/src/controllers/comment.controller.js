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

    res
    .status(200)
    .json({
      success: true,
      data:{
        comment: createdComment
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

export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await CommentModel.aggregate([
      { $match: { postId: new mongoose.Types.ObjectId(postId), parentCommentId: null } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'parentCommentId',
          as: 'replies'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          content: 1,
          createdAt: 1,
          like_count: 1,
          'user._id': 1,
          'user.fullName': 1,
          'user.profileImage': 1,
          replies: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res
    .status(200)
    .json({
      success: true,
      data:{
        comments
      },
      message: "Comments Fetched successfully."
    });
  } catch (error) {
    console.log(error);
    res
    .status(500)
    .json({
      success: false,
      message: "Something went wrong while fetching Comments!",
      error: error
    });
  }
}

export const likeComment = async(req, res) => {
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
      comment.numberOfLikes += 1;
      comment.likes.push(req.userId);
    }
    else{
      comment.numberOfLikes -= 1;
      comment.likes.splice(userIndex, 1);
    }

    await comment.save();
    
    res
    .status(200)
    .json({
      success: true,
      data:{
        comment
      },
      message: "Comment like toggled Successfully",
    });
  } catch (error) {
    res
    .status(500)
    .json({
      success: false,
      message: "Something went wrong while fetching Comments!",
      error: error
    });
  }
}

export const editComment = async (req, res) => {
  try {
    const comment = await CommentModel.findOne({
      _id: req.params.commentId,
      userId: req.userId
    });
    
    if(!comment){
      res
      .status(400)
      .json({
        success: false,
        message: "Comment Not Found",
      });
    }

    const editedComment = await CommentModel.findByIdAndUpdate(
      req.params.commentId,
      {
        content: req.body.content
      },
      {
        new: true
      }
    )
    
    res
    .status(200)
    .json({
      success: true,
      data:{
        comment: editedComment
      },
      message: "Comment like toggled Successfully",
    });
  } catch (error) {
    res
    .status(500)
    .json({
      success: false,
      message: "Something went wrong while fetching Comments!",
      error: error
    });
  }
}