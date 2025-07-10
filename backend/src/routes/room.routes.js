import { Router } from 'express';
import { createRoom, addUser, joinRoom } from '../controllers/room.controller.js';
import { authUser } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/create', authUser, createRoom);

router.post('/add-user', authUser, addUser);

router.get('/join/:roomId', authUser, joinRoom);


export default router;