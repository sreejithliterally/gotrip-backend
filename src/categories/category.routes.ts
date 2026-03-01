import { Router } from 'express';
import { categoryController } from './category.controller';
import { authenticate, authorize } from '../common/middleware/auth';
import { asyncHandler } from '../common/middleware/async-handler';
import { validate } from '../common/utils/validate';
import { createCategorySchema, updateCategorySchema } from './category.validator';
import { UserRole } from '../common/types';

const router = Router();

// Public
router.get('/', asyncHandler(categoryController.getRootCategories));
router.get('/type/:type', asyncHandler(categoryController.getCategoriesByType));
router.get('/:id', asyncHandler(categoryController.getById));

// Admin
router.post('/', authenticate, authorize(UserRole.ADMIN), validate(createCategorySchema), asyncHandler(categoryController.create as any));
router.patch('/:id', authenticate, authorize(UserRole.ADMIN), validate(updateCategorySchema), asyncHandler(categoryController.update as any));
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), asyncHandler(categoryController.delete as any));

export default router;
