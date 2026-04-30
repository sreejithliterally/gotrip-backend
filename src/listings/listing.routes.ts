import { Router } from 'express';
import { listingController } from './listing.controller';
import { authenticate, authorize, optionalAuthenticate } from '../common/middleware/auth';
import { asyncHandler } from '../common/middleware/async-handler';
import { validate } from '../common/utils/validate';
import { createListingSchema, updateListingSchema } from './listing.validator';
import { UserRole } from '../common/types';

const router = Router();

// Public — is_wishlisted flag populated when a valid JWT is present
router.get('/', optionalAuthenticate, asyncHandler(listingController.browse as any));
router.get('/:id', optionalAuthenticate, asyncHandler(listingController.getById as any));

// Vendor
router.post(
  '/',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  validate(createListingSchema),
  asyncHandler(listingController.create as any),
);
router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  validate(updateListingSchema),
  asyncHandler(listingController.update as any),
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  asyncHandler(listingController.delete as any),
);
router.get(
  '/vendor/mine',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  asyncHandler(listingController.getVendorListings as any),
);

// Media
router.post(
  '/:id/media',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  asyncHandler(listingController.addMedia as any),
);
router.delete(
  '/:id/media/:mediaId',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  asyncHandler(listingController.removeMedia as any),
);

export default router;
