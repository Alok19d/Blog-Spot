import { Router } from 'express';
import { authUser } from "../middlewares/auth.middleware.js";
import { create, uploadImage, previewPost, getUserPosts, getUserDashboard, getPosts, getPost, getRecentPosts, getRelatedPosts, getFeaturedPost, updatePost, deletePost } from '../controllers/post.controller.js';
import { upload } from '../middlewares/multer.middleware.js'

const router = Router();

router.post('/create', authUser, upload.single('coverImage'), create);

router.post('/upload-image', authUser, upload.single('image'), uploadImage);

router.get('/preview', authUser, previewPost);

router.get('/my-posts', authUser, getUserPosts);

router.get('/dashboard', authUser, getUserDashboard);

router.get('/fetch-posts', getPosts);

router.get('/post', getPost);

router.get('/recent-posts', getRecentPosts);

router.get('/related-posts', getRelatedPosts);

router.get('/featured-post', getFeaturedPost);

router.put('/update-post/:postId', authUser, updatePost);

router.delete('/delete/:postId', authUser, deletePost);

export default router;