import { Router } from 'express';
import { createCategory, getCategories, postCount, deleteCategory } from '../controllers/category.controller.js'
import { authUser } from '../middlewares/auth.middleware.js'

const router = Router();

router.post('/create', authUser, createCategory);

router.get('/', getCategories);

router.get('/post-count', postCount);

router.delete('/delete/:categoryId', authUser, deleteCategory);


export default router;