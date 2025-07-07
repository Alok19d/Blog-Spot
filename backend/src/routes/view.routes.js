import { Router } from 'express';
import { authUser } from "../middlewares/auth.middleware.js";
import { likePost } from '../controllers/view.controller.js';

const router = Router();

router.put('/likePost/:postId', authUser, likePost);

export default router;