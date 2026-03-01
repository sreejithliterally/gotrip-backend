import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../common/utils/validate';
import { asyncHandler } from '../common/middleware/async-handler';
import { sendOtpSchema, verifyOtpSchema, refreshTokenSchema } from './auth.validator';

const router = Router();

router.post('/send-otp', validate(sendOtpSchema), asyncHandler(authController.sendOtp));
router.post('/verify-otp', validate(verifyOtpSchema), asyncHandler(authController.verifyOtp));
router.post('/refresh-token', validate(refreshTokenSchema), asyncHandler(authController.refreshToken));

export default router;
