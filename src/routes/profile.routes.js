import express from 'express';
import { authMiddleware }from '../middleware/auth.middleware.js';
import profileController from '../controllers/profile.controller.js';

const router = express.Router();

// Update profile (username, email, password, profileImage)
router.patch(
	'/update',
	authMiddleware,
	profileController.uploadMiddleware.single('profileImage'),
	profileController.updateProfile
);

export default router;