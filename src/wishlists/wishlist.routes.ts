import { Router } from 'express';
import { wishlistController } from './wishlist.controller';
import { authenticate } from '../common/middleware/auth';
import { asyncHandler } from '../common/middleware/async-handler';

const router = Router();

// All wishlist routes require authentication
router.post('/:listingId', authenticate, asyncHandler(wishlistController.toggle as any));
router.get('/', authenticate, asyncHandler(wishlistController.getWishlist as any));

export default router;
