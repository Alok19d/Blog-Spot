import { Router } from 'express';
import { authUser } from "../middlewares/auth.middleware.js";
import { toggleBookmark } from '../controllers/bookmark.controller.js';

const router = Router();

router.post('/', authUser, toggleBookmark);

export default router;