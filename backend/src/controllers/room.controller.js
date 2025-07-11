import { z } from 'zod';
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
    const addUserSchema = z.object({
      email: z.string().email(),
      roomId: z.string()
    });

    const { roomId, email } = req.body;

    /* Input Validation */
    const validateInput = addUserSchema.parse({
      email, 
      roomId
    });

    /* Finding User in User Table */
    const user = await UserModel.findOne({email});
    if(!user){
      res
      .status(404)
      .json({
        success: false,
        message: 'User not found.'
      })
      return;  
    }

    const room = await RoomModel.findOne({ roomId, admin: req.userId });
    if(!room){
      res
      .status(404)
      .json({
        success: false,
        message: 'Room not found.'
      })
      return;  
    }

    /* Checking if User is already added */
    const alreadyAdded = room.users.includes(user._id);
    if (alreadyAdded) {
      res
      .status(400)
      .json({
        success: false,
        message: 'User already added to the room.'
      });
      return;
    }

    /* Adding User to room */
    room.users.push(user._id);
    await room.save();
    
    const updatedRoom = await RoomModel.findById(room._id).populate('users', 'fullname profileImg');

    res
    .status(200)
    .json({
      success: true,
      message: 'User added to the room successfully.',
      data: {
        room: updatedRoom
      }
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
      message: "Server error: Couldn't add user to room.",
      error
    });
  }
}

export const removeUser = async(req, res) => {
  try {
    const addUserSchema = z.object({
      roomId: z.string(),
      userId: z.string()
    });

    const { userId, roomId } = req.body;

    /* Input Validation */
    const validateInput = addUserSchema.parse({
      userId, 
      roomId
    });

    const room = await RoomModel.findOne({ roomId, admin: req.userId });
      if(!room){
      res
      .status(404)
      .json({
        success: false,
        message: 'Room not found.'
      })
      return;  
    }

    await RoomModel.updateOne(
      { _id: room._id },
      { $pull: { users: userId } }
    );

    const updatedRoom = await RoomModel.findById(room._id).populate('users', 'fullname profileImg');

    res
    .status(200)
    .json({
      success: true,
      message: 'User removed from the room successfully.',
      data: {
        room: updatedRoom
      }
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
      message: "Server error: Couldn't remove user from room.",
      error
    });
  }
}

export const deleteRoom = async(req, res) => {
  try {
    
  } catch (error) {
    
  }
}