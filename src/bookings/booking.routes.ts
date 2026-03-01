import { Router } from 'express';
import { bookingController } from './booking.controller';
import { authenticate, authorize } from '../common/middleware/auth';
import { asyncHandler } from '../common/middleware/async-handler';
import { validate } from '../common/utils/validate';
import {
  createBookingSchema,
  cancelBookingSchema,
  setAvailabilitySchema,
  bulkAvailabilitySchema,
} from './booking.validator';
import { UserRole } from '../common/types';

const router = Router();

// User bookings
router.post('/', authenticate, validate(createBookingSchema), asyncHandler(bookingController.create as any));
router.get('/', authenticate, asyncHandler(bookingController.getUserBookings as any));
router.get('/:id', authenticate, asyncHandler(bookingController.getById as any));
router.post('/:id/cancel', authenticate, validate(cancelBookingSchema), asyncHandler(bookingController.cancel as any));

// Public: check availability
router.get('/availability/:listingId', asyncHandler(bookingController.getAvailability));

// Vendor: manage availability
router.post(
  '/availability',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  validate(setAvailabilitySchema),
  asyncHandler(bookingController.setAvailability as any),
);
router.post(
  '/availability/bulk',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  validate(bulkAvailabilitySchema),
  asyncHandler(bookingController.setBulkAvailability as any),
);

export default router;
