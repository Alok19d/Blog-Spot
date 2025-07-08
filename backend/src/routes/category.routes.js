import { Router } from 'express';
import { createCategory, getCategories, deleteCategory } from '../controllers/category.controller.js'
import { authUser } from '../middlewares/auth.middleware.js'

const router = Router();

router.post('/create', authUser, createCategory);

router.get('/', getCategories);

router.delete('/delete/:categoryId', authUser, deleteCategory);


export default router;