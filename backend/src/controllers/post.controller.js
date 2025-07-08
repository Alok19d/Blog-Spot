import { z } from 'zod';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid'
import PostModel from '../models/post.model.js';
import ViewModel from '../models/view.model.js';
import CommentModel from '../models/comment.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'

export const create = async (req, res) => {
  try {
    const coverImageLocalPath = req.file?.path;
    let coverImage = '';

    if(coverImageLocalPath){
      coverImage = await uploadOnCloudinary(coverImageLocalPath);

      if(!coverImage || !coverImage.url){
        res
        .status(500)
        .json({
          success: false,
          message: "Something went wrong while uploading coverImage."
        });

        return;
      }
    }

    const createPostSchema = z.object({
      title: z.string().min(10, {message: "Title must be atleast 10 characters"}),
      excerpt: z.string(),
      content: z.string(),
      category: z.string(),
      tags: z.array(z.string()),
      status: z.string(),
      readingTime: z.string(),
      tableOfContent: z.array(z.object({
        id: z.string(),
        level: z.number(),
        textContent: z.string()
      }))
    });
    
    const {title, excerpt, content, category, tags, status, readingTime, tableOfContent} = req.body;
    
    let slug = title
    .split(' ')
    .join('-')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '-');

    /* Checking if Slug is Already Used */
    let slugExists = await PostModel.findOne({slug});

    if(slugExists){
      let newSlug = ''
      while(slugExists){
        const id = nanoid(8);
        newSlug = `${slug}-${id}`;
        slugExists = await PostModel.findOne({newSlug})
      }
      slug = newSlug;
    }

    const Tags = await JSON.parse(tags);
    const TOC = await JSON.parse(tableOfContent);

    /* Input Validation */
    const validatePost = createPostSchema.parse({
      title, 
      excerpt, 
      content, 
      category, 
      tags: Tags, 
      tableOfContent: TOC,
      status,
      readingTime
    });

    /* Creating Post */
    const post = await PostModel.create({
      title, 
      excerpt, 
      content, 
      coverImage: coverImage.url, 
      category, 
      tags: Tags, 
      tableOfContent: TOC,
      slug,
      author: req.userId,
      status,
      readingTime
    });

    res
    .status(201)
    .json({
      success: true,
      data:{
        post
      },
      message: "Post Created successfully."
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
      message: "Server error: Unable to create post.",
      error: error
    });
  }
}

export const uploadImage = async (req, res) => {
  try {
    const imageLocalPath = req.file?.path;

    if(!imageLocalPath){
      res
      .status(400)
      .json({
        success: false,
        message: "Image Input is required."
      });
      return;
    }

    let image = await uploadOnCloudinary(imageLocalPath);

    if(!image || !image.url){
      res
      .status(500)
      .json({
        success: false,
        message: "Failed to upload profile image. Please try again."
      });
      return;
    }

    res
    .status(200)
    .json({
      success: true,
      data: {
        image: image.url
      },
      message: "Image updated successfully.",
    });
  } catch (error) {
    res
    .status(200)
    .json({
      success: true,
      message: "Server error: Couldn't upload Image at this time.",
      error
    });
  }
}

export const previewPost = async(req, res) => {
  try {
    const { postId } = req.query;
    
    if(!postId){
      res
      .status(400)
      .json({
        success: false,
        message: "Post ID is required."
      });
      return;
    }
  
    const post = await PostModel.findOne({
      _id: postId,
      author: req.userId
    })
    .populate('author', 'fullname profileImg')
    .populate('category', 'name');
  
    if (!post) {
      res
      .status(404)
      .json({
        success: false,
        message: "Post not found."
      });
      return;
    }

    res
    .status(200)
    .json({
      success: true,
      data:{
        post,
      },
      message: "Post Fetched successfully."
    });
  } catch (error) {
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Unable to fetch post.",
      error: error
    });
  }
}

export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    if(!postId){
      res
      .status(400)
      .json({
        success: false,
        message: "Post ID is required."
      });
      return;
    }

    /* Checking if Post exists */
    const post = await PostModel.findOne({
      _id: postId,
      author: req.userId
    });

    if (!post) {
      res
      .status(404)
      .json({
        success: false,
        message: "Post not found."
      });
      return;
    }

    const coverImageLocalPath = req.file?.path;
    let coverImage = '';

    if(coverImageLocalPath){
      coverImage = await uploadOnCloudinary(coverImageLocalPath);

      if(!coverImage || !coverImage.url){
        res
        .status(500)
        .json({
          success: false,
          message: "Something went wrong while uploading coverImage."
        });

        return;
      }
    }

    const updatePostSchema = z.object({
      title: z.string().min(10, {message: "Title must be atleast 10 characters"}).optional(),
      excerpt: z.string().optional(),
      content: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      status: z.string().optional(),
      readingTime: z.string().optional(),
      tableOfContent: z.array(z.object({
        id: z.string(),
        level: z.number(),
        textContent: z.string()
      })).optional()
    });

    const {title, excerpt, content, category, tags, status, readingTime, tableOfContent} = req.body;
    
    let Tags = [], TOC = [];
    if(tags){ 
      Tags = await JSON.parse(tags);
    }
    if(tableOfContent){
      TOC = await JSON.parse(tableOfContent);
    }
    
    /* Input Validation */
    const validatePost = updatePostSchema.parse({
      title, 
      excerpt, 
      content, 
      category, 
      tags: Tags, 
      tableOfContent: TOC,
      status,
      readingTime
    });

    /* Updating Post */
    const updatedPost = await PostModel.findOneAndUpdate(
      {
        _id: postId,
        author: req.userId
      },
      {
        $set: {
          ...(title) && { title },
          ...(excerpt) && { excerpt },
          ...(content) && { content },
          ...(category) && { category },
          ...(tags) && { Tags },
          ...(status) && { status },
          ...(readingTime) && { readingTime },
          ...(tableOfContent) && { TOC },
        }
      },
      {
        new: true
      }
    );

    if(status && status === "draft"){
      await ViewModel.findOneAndDelete({
        postId
      });
    }

    res
    .status(200)
    .json({
      success: true,
      data: {
        post: updatedPost
      },
      message: "Post Updated successfully."
    });
  } catch(error) {
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
      message: "Server error: Unable to update post.",
      error: error
    });
  }
}

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    if(!postId){
      res
      .status(400)
      .json({
        success: false,
        message: "Post ID is required."
      });
      return;
    }

    await PostModel.findOneAndDelete({
      _id: postId,
      author: req.userId
    });

    res
    .status(200).json({
      success: true,
      message: "Post Deleted successfully."
    });
  } catch (error) {
    res
    .status(500)
    .json({
      success: false,
      message: "Something went wrong while deleting Post!",
      error: error
    });
  }
}

export const getPost = async (req, res) => {
  try {
    const { slug, postId } = req.query;

    if(!slug && !postId){
      res
      .status(400)
      .json({
        success: false,
        message: "Either of slug or postId is required."
      });
      return;
    }

    /* Fetching Post */
    const post = await PostModel.findOne({
      ...(slug) && { slug },
      ...(postId) && { _id: postId },
      status: 'published'
    })
    .populate('author', 'fullname profileImg bio')
    .populate('category', 'name');

    if (!post) {
      res
      .status(404)
      .json({
        success: false,
        message: "Post not found."
      });
      return;
    }

    /* Increasing View Count */
    const updatedView = await ViewModel.findOneAndUpdate(
      { 
        postId: post._id 
      },
      {
        $inc: { 
          viewCount: 1 
        }
      },
      { 
        new: true,
        upsert: true 
      }
    ).lean();

    res
    .status(200)
    .json({
      success: true,
      data:{
        post
      },
      message: "Post Fetched successfully."
    });
  } catch (error) {
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Unable to fetch post.",
      error: error
    });
  }
}

export const getRelatedPosts = async (req, res) => {
  try {
    const { postId } = req.query;

    if(!postId){
      res
      .status(400)
      .json({
        success: false,
        message: "Post ID is required."
      });
      return;
    }

    /* Checking if Post exists */
    const post = await PostModel.findById(postId).lean();

    if (!post) {
      res
      .status(404)
      .json({
        success: false,
        message: "Post not found."
      });
      return;
    }

    const { category, tags } = post;

    /* Find Related Posts */
    const relatedPosts = await PostModel.find({
      _id: { $ne: postId }, 
      category: category,  
      tags: { $in: tags }, 
      status: "published" 
    })
    .select('title coverImage slug readingTime')
    .limit(3) 
    .sort({ createdAt: -1 })
    .lean();

    res
    .status(200)
    .json({
      success: true,
      data:{
        posts: relatedPosts
      },
      message: "Post Fetched successfully."
    });
  } catch (error) {
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Unable to fetch related posts.",
      error: error
    });
  }
}

export const getFeaturedPost = async (req, res) => {
  try {
    const topViewed = await ViewModel
    .findOne()
    .sort({ viewCount: -1, likeCount: -1 }) 
    .lean(); 

    if (!topViewed || !topViewed.postId) {
      res
      .status(404)
      .json({
        success: false,
        message: 'No featured post found' 
      });
      return;
    }

    const featuredPost = await PostModel
    .findById(topViewed.postId)
    .select('_id title excerpt coverImage slug author readingTime updatedAt')
    .populate('author', "fullname profileImg");

    if (!featuredPost) {
      res
      .status(404)
      .json({
        success: false,
        message: 'No featured post found' 
      });
    }

    res
    .status(200)
    .json({
      success: true,
      data:{
        post: featuredPost
      },
      message: "Featured Post Fetched successfully."
    });
  } catch (error) {
    res
    .status(500)
    .json({
      success: false,
      message: "Something went wrong while fetching Featured Post!",
      error: error
    });
  }
}

export const countByCategory = async (req, res) => {
  try {
    const counts = await PostModel.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $unwind: "$category"
      },
      {
        $project: {
          _id: 0,
          categoryId: "$category._id",
          categoryName: "$category.name",
          count: 1
        }
      }
    ]);

    const postCount = {}; 
    counts.map(item => (
      postCount[item.categoryName] = item.count 
    ));

    res
    .status(200)
    .json({
      success: true,
      data: {
        postCount
      },
      message: "Post count by category fetched successfully."
    });
  } catch (error) {
    console.log(error);
    res
    .status(500)
    .json({
      success: false,
      error,
      message: "Server error: Unable to fetch post count by category."
    });
  }
}

export const getPosts = async (req, res) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 5;
    const sortDirection = (req.query.order === 'asc') ? 1 : -1;

    const { userId, category, searchTerm } = req.query;

    const posts = await PostModel.aggregate([
      { 
        $match: {
          status: 'published',
          ...(userId && { author: new mongoose.Types.ObjectId(userId) }),
          ...(category && { category: new mongoose.Types.ObjectId(category) }),
          ...(searchTerm && {
            $or: [
              { title: { $regex: searchTerm, $options: 'i' } },
              { content: { $regex: searchTerm, $options: 'i' } }
            ]
          })
        } 
      },
      {
        $lookup: {
          from: 'views',
          localField: '_id',
          foreignField: 'postId',
          as: 'viewStats'
        }
      },
      {
        $unwind: {
          path: '$viewStats',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          viewCount: '$viewStats.viewCount',
          likeCount: '$viewStats.likeCount'
        }
      },
      { $sort: { updatedAt: sortDirection } },
      { $skip: startIndex },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $unwind: {
          path: '$author',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          excerpt: 1,
          coverImage: 1,
          slug: 1,
          readingTime: 1,
          updatedAt: 1,
          viewCount: 1,
          likeCount: 1,
          author: {
            _id: 1,
            fullname: 1,
            profileImg: 1
          }
        }
      }
    ]);

    const totalPosts = await PostModel.countDocuments({ 
      status: "published",
      ...(userId && { author: new mongoose.Types.ObjectId(userId) }),
      ...(category && { category: new mongoose.Types.ObjectId(category) }),
      ...(searchTerm && {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { content: { $regex: searchTerm, $options: 'i' } }
        ]
      }) 
    });
    
    res
    .status(200)
    .json({
      success: true,
      data:{
        posts, 
        totalPosts
      },
      message: "Post Fetched successfully."
    });
  } catch (error) {
    console.log(error);
    res
    .status(500)
    .json({
      success: false,
      message: "Something went wrong while fetching Post!",
      error: error
    });
  }
}

export const getUserPosts = async (req, res) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 8;

    const posts = await PostModel.aggregate([
      {
        $match: {
          author: new mongoose.Types.ObjectId(req.userId)
        }
      },
      {
        $lookup: {
          from: 'views',
          localField: '_id',
          foreignField: 'postId',
          as: 'viewStats'
        }
      },
      {
        $unwind: {
          path: '$viewStats',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          viewCount: { $ifNull: ['$viewStats.viewCount', 0] },
          likeCount: { $ifNull: ['$viewStats.likeCount', 0] }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true
        }
      },
      { $sort: { updatedAt: -1 } },
      { $skip: startIndex },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          'category._id': 1,
          'category.name': 1,
          status: 1,
          createdAt: 1,
          viewCount: 1,
          likeCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        posts
      },
      message: "User Posts retrieved successfully."
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching user posts!",
      error: error.message
    });
  }
};

export const getUserDashboard = async (req, res) => {
  try {
    /* Fetching All Posts of User */
    const posts = await PostModel.find({ author: req.userId }).select('_id status');
    const postIds = posts.map(post => post._id);

    /* Total Posts and Published Posts */
    const totalPosts = posts.length;
    const publishedPosts = posts.filter(post => post.status === 'published').length;

    /* Total Views and Total Likes */
    const viewStats = await ViewModel.aggregate([
      { $match: { postId: { $in: postIds } } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$viewCount' },
          totalLikes: { $sum: '$likeCount' }
        }
      }
    ]);
    const totalViews = viewStats[0]?.totalViews || 0;
    const totalLikes = viewStats[0]?.totalLikes || 0;

    /* Total Comments */
    const totalComments = await CommentModel.countDocuments({ postId: { $in: postIds } });

    /* Comments this Week */
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const commentsThisWeek = await CommentModel.countDocuments({
      postId: { $in: postIds },
      createdAt: { $gte: startOfWeek }
    });

    /* Likes this Week */
    const weekStats = await ViewModel.aggregate([
      { $match: { 
          postId: { $in: postIds },
          updatedAt: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: null,
          likesThisWeek: { $sum: '$likeCount' }
        }
      }
    ]);

    const likesThisWeek = weekStats[0]?.likesThisWeek || 0;

    /* Views this Month */
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthStats = await ViewModel.aggregate([
      { $match: { 
          postId: { $in: postIds },
          updatedAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          viewsThisMonth: { $sum: '$viewCount' }
        }
      }
    ]);

    const viewsThisMonth = monthStats[0]?.viewsThisMonth || 0;

    res
    .status(200)
    .json({
      success: true,
      data: {
        totalViews,
        viewsThisMonth,
        totalPosts,
        publishedPosts,
        totalLikes,
        likesThisWeek,
        totalComments,
        commentsThisWeek
      },
      message: "Dashboard data fetched successfully."
    });
  } catch (error) {
    console.log(error);
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Unable to fetch dashboard data.",
      error
    });
  }
}