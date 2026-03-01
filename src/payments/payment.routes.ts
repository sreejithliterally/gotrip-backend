import { Router } from 'express';
import { paymentController } from './payment.controller';
import { authenticate } from '../common/middleware/auth';
import { asyncHandler } from '../common/middleware/async-handler';

const router = Router();

router.post('/create-order', authenticate, asyncHandler(paymentController.createOrder as any));
router.post('/verify', asyncHandler(paymentController.verifyPayment));
router.post('/webhook', asyncHandler(paymentController.webhook)); // No auth — Razorpay calls this

export default router;
