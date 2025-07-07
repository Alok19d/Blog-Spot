import { z } from 'zod';
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
    
    const slug = title
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

// Done

export const getUserPosts = async (req, res) => {
  try {
    const startIndex = (req.query.startIndex || 0);
    const limit = parseInt(req.query.limit) || 8;

    const posts = await PostModel.find({
      author: req.userId
    }).sort({updatedAt: -1}).skip(startIndex).limit(limit);

    const totalPosts = await PostModel.countDocuments({author: req.userId});

    const publishedPosts = await PostModel.countDocuments({
      author: req.userId,
      status: 'published'
    });

    res
    .status(200)
    .json({
      success: true,
      data:{
        posts, 
        total: totalPosts, 
        published: publishedPosts
      },
      message: "User Post Retrived successfully."
    })
  } catch(error){
    res
    .status(500)
    .json({
      success: false,
      message: "Something went wrong while fetching user posts!",
      error: error
    });
  }
}

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
          totalViews: { $sum: '$view_count' },
          totalLikes: { $sum: { $size: { $ifNull: ['$likes', []] } } }
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

    // const startOfMonth = new Date();
    // startOfMonth.setDate(1);
    // startOfMonth.setHours(0, 0, 0, 0);

    const weekStats = await ViewModel.aggregate([
      { $match: { 
          postId: { $in: postIds },
          updatedAt: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: null,
          viewsThisWeek: { $sum: '$view_count' },
          likesThisWeek: { $sum: { $size: { $ifNull: ['$likes', []] } } }
        }
      }
    ]);

    const viewsThisWeek = weekStats[0]?.viewsThisWeek || 0;
    const likesThisWeek = weekStats[0]?.likesThisWeek || 0;

    res
    .status(200)
    .json({
      success: true,
      data: {
        totalViews,
        viewsThisWeek,
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
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Unable to fetch dashboard data.",
      error
    });
  }
}

export const getPosts = async (req, res) => {
  try {
    const startIndex = (req.query.startIndex || 0);
    const limit = parseInt(req.query.limit) || 8;
    const sortDirection = (req.query.order === 'asc') ? 1 : -1;
    
    const posts = await PostModel.find({
      ...(req.query.userId) && {author: req.query.userId},
      ...(req.query.category) && {category: req.query.category},
      ...(req.query.searchPosts) && {
        $or: {
          title: {$regex: req.query.searchTerm, $options: 'i'},
          content: {$regex: req.query.searchTerm, $options: 'i'}
        }
      }
    }).sort({updatedAt: sortDirection}).skip(startIndex).limit(limit);

    const totalPosts = await PostModel.countDocuments({author: req.userId});
    
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
    res
    .status(500)
    .json({
      success: false,
      message: "Something went wrong while fetching Post!",
      error: error
    });
  }
}

export const getPost = async (req, res) => {
  try {
    const post = await PostModel.findOne({
      ...(req.query.slug) && {slug: req.query.slug},
      ...(req.query.postId) && {_id: req.query.postId},
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

    const updatedView = await ViewModel.findOneAndUpdate(
      { postId: post._id },
      {
        $inc: { view_count: 1 }
      },
      { new: true, upsert: true } // creates document if not found
    ).lean();

    res
    .status(200)
    .json({
      success: true,
      data:{
        post,
        views: updatedView?.view_count || 1,
        like_count: updatedView?.like_count || 0,
        likes: updatedView?.likes || [],
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

export const getRecentPosts = async (req, res) => {
  try {
    const startIndex = (req.query.startIndex || 0);
    const limit = parseInt(req.query.limit) || 2;
  
    const posts = await PostModel.find()
      .sort({ updatedAt: 1 })
      .skip(startIndex)
      .limit(limit)
      .select('_id title excerpt coverImage slug updatedAt')
      .populate('author', 'fullname profileImg');
  
    res
    .status(200)
    .json({
      success: true,
      data:{
        posts
      },
      message: "Recent Post Fetched successfully."
    });
  } catch (error) {
    res
    .status(500)
    .json({
      success: false,
      message: "Something went wrong while fetchingRecent  Post!",
      error: error
    });
  }
}

export const getRelatedPosts = async (req, res) => {

}

export const getFeaturedPost = async (req, res) => {
  try {
    
  } catch (error) {
    res
    .status(500)
    .json({
      success: false,
      message: "Something went wrong while fetchingRecent  Post!",
      error: error
    });
  }
}

export const updatePost = async (req, res) => {
  try {
    const post = await PostModel.findOneAndUpdate(
      {
        _id: req.params.postId,
        author: req.userId
      },
      {
        $set: {
          title: req.body.title,
          excerpt: req.body.excerpt,
          category: req.body.category,
          tags: req.body.tags,
          content: req.body.content,
          status: req.body.status
        }
      },
      {
        new: true
      }
    );

    res
    .status(200).json({
      success: true,
      data: {
        post
      },
      message: "Post Updated successfully."
    });
  } catch(error) {
    res
    .status(500)
    .json({
      success: false,
      message: "Something went wrong while updating Post!",
      error: error
    });
  }
}

export const deletePost = async (req, res) => {
  try {
    await PostModel.findOneAndDelete({
      _id: req.params.postId,
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