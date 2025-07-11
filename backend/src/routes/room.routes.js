import { Router } from 'express';
import { createRoom, addUser, removeUser, deleteRoom } from '../controllers/room.controller.js';
import { authUser } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/create', authUser, createRoom);

router.put('/add', authUser, addUser);

router.put('/remove', authUser, removeUser);

router.delete('/delete/:roomId', authUser, deleteRoom);


export default router;