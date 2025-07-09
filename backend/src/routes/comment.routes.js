import { Router } from 'express';
import { authUser } from "../middlewares/auth.middleware.js";
import { createComment, getComments, getReplies, likedComments,  toggleLike, editComment, deleteComment } from '../controllers/comment.controller.js';

const router = Router();

router.post('/create', authUser, createComment);

router.get('/post/:postId', getComments);

router.get('/replies/:commentId', getReplies);

router.get('/likes/:postId', authUser, likedComments);

router.put('/like/:commentId', authUser, toggleLike);

router.put('/edit/:commentId', authUser, editComment);

router.delete('/delete/:commentId', authUser, deleteComment);


export default router;