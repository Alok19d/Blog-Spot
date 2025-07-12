import { Router } from 'express';
import { createRoom, addUser, getRoomDetails, removeUser, deleteRoom } from '../controllers/room.controller.js';
import { authUser } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/create', authUser, createRoom);

router.put('/add', authUser, addUser);

router.get('/join/:roomId', authUser, getRoomDetails);

router.put('/remove', authUser, removeUser);

router.delete('/delete/:roomId', authUser, deleteRoom);


export default router;