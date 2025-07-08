import { Router } from 'express';
import { authUser } from "../middlewares/auth.middleware.js";
import { likes, fetchViewsAndLikes, toggleLike } from '../controllers/view.controller.js';

const router = Router();

router.get('/', authUser, likes);

router.get('/status', fetchViewsAndLikes);

router.put('/toggleLike/:postId', authUser, toggleLike);


export default router;