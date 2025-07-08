import { Router } from 'express';
import { authUser } from "../middlewares/auth.middleware.js";
import { create, uploadImage, previewPost, updatePost, deletePost, getPost, getRelatedPosts, getFeaturedPost, countByCategory, getPosts, getUserPosts, getUserDashboard } from '../controllers/post.controller.js';
import { upload } from '../middlewares/multer.middleware.js'

const router = Router();

router.post('/create', authUser, upload.single('coverImage'), create);

router.post('/upload-image', authUser, upload.single('image'), uploadImage);

router.get('/preview', authUser, previewPost);

router.put('/update-post/:postId', upload.single('coverImage'), authUser, updatePost);

router.delete('/delete/:postId', authUser, deletePost);

router.get('/post', getPost);

router.get('/related-posts', getRelatedPosts);

router.get('/featured-post', getFeaturedPost);

router.get('/count-by-category', countByCategory);

router.get('/fetch-posts', getPosts);

router.get('/dashboard', authUser, getUserDashboard);

router.get('/my-posts', authUser, getUserPosts);


export default router;