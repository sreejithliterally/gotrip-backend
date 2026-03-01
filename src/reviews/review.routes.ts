import { Router } from 'express';
import { reviewController } from './review.controller';
import { authenticate } from '../common/middleware/auth';
import { asyncHandler } from '../common/middleware/async-handler';
import { validate } from '../common/utils/validate';
import { createReviewSchema, updateReviewSchema } from './review.validator';

const router = Router();

// Public
router.get('/listing/:listingId', asyncHandler(reviewController.getByListing));

// Authenticated
router.post('/', authenticate, validate(createReviewSchema), asyncHandler(reviewController.create as any));
router.patch('/:id', authenticate, validate(updateReviewSchema), asyncHandler(reviewController.update as any));
router.delete('/:id', authenticate, asyncHandler(reviewController.delete as any));

export default router;
