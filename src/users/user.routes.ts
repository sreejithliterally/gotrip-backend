import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate, authorize } from '../common/middleware/auth';
import { asyncHandler } from '../common/middleware/async-handler';
import { UserRole } from '../common/types';

const router = Router();

// Protected routes
router.get('/me', authenticate, asyncHandler(userController.getProfile as any));
router.patch('/me', authenticate, asyncHandler(userController.updateProfile as any));

// Admin routes
router.get('/', authenticate, authorize(UserRole.ADMIN), asyncHandler(userController.listUsers as any));
router.patch('/:userId/role', authenticate, authorize(UserRole.ADMIN), asyncHandler(userController.setRole as any));

export default router;
