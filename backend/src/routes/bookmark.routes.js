import { Router } from 'express';
import { authUser } from "../middlewares/auth.middleware.js";
import { bookmarks, fetchBookmarkedStatus, toggleBookmark } from '../controllers/bookmark.controller.js';

const router = Router();

router.get('/', authUser, bookmarks);

router.get('/status', authUser, fetchBookmarkedStatus);

router.put('/toggle/:postId', authUser, toggleBookmark);


export default router;