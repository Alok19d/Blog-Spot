import { nanoid } from 'nanoid';
import RoomModel from "../models/room.model.js";
import UserModel from "../models/user.model.js";
import PostModel from '../models/post.model.js';

export const createRoom = async(req, res) => {
  try {
    const { postId } = req.body;
    if(!postId){
      res
      .status(400)
      .json({
        success: false,
        message: 'Post Id is required.'
      })
      return;  
    }

    /* Checking if Post exists */
    const post = await PostModel.findById(postId);
    if (!post) {
      res
      .status(404)
      .json({
        success: false,
        message: 'Post not found.'
      });
      return;
    }

    /* Checking if User is author of Post */
    if (post.author.toString() !== req.userId.toString()) {
      res
      .status(403)
      .json({
        success: false,
        message: 'Invalid Request.'
      });
      return;
    }

    /* Check if Room for given Post already exists */
    const roomExists = await RoomModel.findOne({ postId, admin: req.userId });
    if(roomExists){
      res
      .status(200)
      .json({
        success: true,
        data: {
          roomId: roomExists.roomId
        },
        message: 'Room already exists!'
      });
      return;
    }

    let roomId = nanoid(10);
    let roomIdExists = await RoomModel.findOne({roomId});
    
    while(roomIdExists){
      roomId = nanoid(10);
      roomIdExists = await RoomModel.findOne({roomId});
    }

    const room = await RoomModel.create({
      admin: req.userId,
      roomId,
      postId
    });

    res
    .status(200)
    .json({
      success: true,
      data: {
        roomId: room.roomId
      },
      message: 'Room created successfully!'
    });
  } catch (error) {
    console.log(error);
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Couldn't create room.",
      error
    });
  }
}

export const addUser = async(req, res) => {
  try {
    const { roomId, email } = req.body;
    if(!roomId){
      res
      .status(400)
      .json({
        success: false,
        message: 'Room Id is required.'
      })
      return;  
    }

    const user = UserModel.findOne({email});
    if(!user){

    }

  } catch (error) {
    
  }
}

export const joinRoom = async(req, res) => {
  try {
    
  } catch (error) {
    
  }
}