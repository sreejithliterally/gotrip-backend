import { Router } from 'express';
import { vendorController } from './vendor.controller';
import { authenticate, authorize } from '../common/middleware/auth';
import { asyncHandler } from '../common/middleware/async-handler';
import { validate } from '../common/utils/validate';
import { applyVendorSchema, reviewVendorSchema } from './vendor.validator';
import { UserRole } from '../common/types';

const router = Router();

// Vendor self-service
router.post('/apply', authenticate, validate(applyVendorSchema), asyncHandler(vendorController.apply as any));
router.get('/me', authenticate, asyncHandler(vendorController.getMyProfile as any));
router.get('/dashboard', authenticate, authorize(UserRole.VENDOR), asyncHandler(vendorController.getDashboard as any));

// Admin
router.get('/', authenticate, authorize(UserRole.ADMIN), asyncHandler(vendorController.listApplications as any));
router.patch('/:vendorId/review', authenticate, authorize(UserRole.ADMIN), validate(reviewVendorSchema), asyncHandler(vendorController.reviewApplication as any));

export default router;
