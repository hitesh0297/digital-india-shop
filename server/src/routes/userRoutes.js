import { Router } from 'express';
import User from '../../models/userModel.js';
import { deleteUser, getUserProfile, getUsers, updateUserProfile } from '../../controllers/userControllers.js';

const router = Router();

// Get all users
router.get('/', getUsers);

// Get user by id
router.get('/:userId', getUserProfile);

// Update user
router.put('/:userId', updateUserProfile);

// Delete user
router.delete('/:userId', deleteUser);

export default router;
