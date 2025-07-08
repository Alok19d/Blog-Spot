import { Router } from 'express';
import { authUser } from "../middlewares/auth.middleware.js";
import { createComment, getPostComments, likeComment, editComment } from '../controllers/comment.controller.js';

const router = Router();

router.post('/create', authUser, createComment);

router.get('/getPostComments/:postId', getPostComments);

router.put('/likeComment/:commentId', authUser, likeComment);

router.put('/editComment/:commentId', authUser, editComment);

// router.delete('/deleteComment/:commentId', authUser, deleteComment);


export default router;