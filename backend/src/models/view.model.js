import mongoose from "mongoose";

const viewSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    viewCount: {
      type: Number,
      default: 0
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    likeCount: {
      type: Number,
      default: 0
    }
  },{
    timestamps: true
  }
)

const ViewModel = mongoose.model('View',viewSchema)
export default ViewModel;