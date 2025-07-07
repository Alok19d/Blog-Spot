import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true, 
    }
  },
  {
    timestamps: true
  }
);

const BookmarkModel = mongoose.model('Bookmark',bookmarkSchema);

export default BookmarkModel;