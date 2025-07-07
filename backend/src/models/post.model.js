import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    excerpt: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    coverImage: {
      type: String,
      default: ''
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    tags: [
      {
        type: String,
      }
    ],
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    tableOfContent: [
      {
        id: String,
        level: Number,
        textContent: String,
      }
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readingTime: {
      type: String, 
      default: '0 min'
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft"
    },
  },
  {
    timestamps: true
  }
)

const PostModel = mongoose.model('Post',postSchema)
export default PostModel;