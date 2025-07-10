import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

const RoomModel = mongoose.model('Room', roomSchema);
export default RoomModel;