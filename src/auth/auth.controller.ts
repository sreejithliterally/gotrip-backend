import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../common/utils/response';
import { SendOtpInput, VerifyOtpInput, RefreshTokenInput } from './auth.validator';

export class AuthController {
  async sendOtp(req: Request, res: Response) {
    const result = await authService.sendOtp(req.body as SendOtpInput);
    return sendSuccess(res, result, 'OTP sent successfully');
  }

  async verifyOtp(req: Request, res: Response) {
    const result = await authService.verifyOtp(req.body as VerifyOtpInput);
    return sendSuccess(res, result, 'OTP verified successfully');
  }

  async refreshToken(req: Request, res: Response) {
    const { refresh_token } = req.body as RefreshTokenInput;
    const result = await authService.refreshToken(refresh_token);
    return sendSuccess(res, result, 'Token refreshed');
  }
}

export const authController = new AuthController();
