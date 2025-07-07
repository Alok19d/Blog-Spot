import z from 'zod';
import CommentModel from '../models/comment.model.js'

export const createComment = async (req, res) => {
  try{
    const {content, postId} = req.body;

    const comment = await CommentModel
    .create({
      userId: req.userId,
      postId,
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
        message: "Input Validation Error",
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
    const comments = await CommentModel
    .find({postId: req.params.postId})
    .populate('userId', 'fullname profileImg')
    .sort({createdAt: -1});

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