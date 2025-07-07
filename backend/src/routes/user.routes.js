import { Router } from "express";
import { signup, signin, google, profile, updateProfile, updatePassword, updateAvatar, deleteUser } from "../controllers/user.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";
import { upload } from '../middlewares/multer.middleware.js'

const router = Router();

router.post('/signup', signup);

router.post('/signin', signin);

router.post('/google', google);

router.get('/profile', authUser, profile);

router.put('/update-profile', authUser, updateProfile);

router.put('/update-password', authUser, updatePassword);

router.put('/update-avatar',upload.single('profileImg'), authUser, updateAvatar);

router.delete('/delete', authUser, deleteUser);


export default router;