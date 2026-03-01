import redis from '../db/redis';
import { User } from '../models/user.model';
import { generateOtp, otpRedisKey } from '../common/utils/otp';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../common/utils/jwt';
import { ApiError } from '../common/utils/api-error';
import { config } from '../common/config';
import { sendOtpEmail } from '../common/utils/mailer';
import { UserRole, OtpChannel } from '../common/types';
import { SendOtpInput, VerifyOtpInput } from './auth.validator';

export class AuthService {
  async sendOtp(input: SendOtpInput) {
    const { channel, email, phone } = input;
    const identifier = channel === OtpChannel.EMAIL ? email! : phone!;

    const cooldownKey = `otp_cooldown:${channel}:${identifier}`;
    const cooldown = await redis.get(cooldownKey);
    if (cooldown) throw ApiError.tooMany('Please wait before requesting another OTP');

    const otp = generateOtp();
    const key = otpRedisKey(channel, identifier);

    await redis.setex(key, config.otp.expirySeconds, otp);
    await redis.setex(cooldownKey, 60, '1');

    if (channel === OtpChannel.EMAIL) {
      await sendOtpEmail(identifier, otp);
    }
    // TODO: add SMS sending here when SMS gateway is configured

    return { message: `OTP sent to ${channel}`, channel, identifier };
  }

  async verifyOtp(input: VerifyOtpInput) {
    const { channel, email, phone, otp, full_name } = input;
    const identifier = channel === OtpChannel.EMAIL ? email! : phone!;

    const key = otpRedisKey(channel, identifier);
    const storedOtp = await redis.get(key);

    if (!storedOtp) throw ApiError.badRequest('OTP expired or not found');
    if (storedOtp !== otp) throw ApiError.badRequest('Invalid OTP');

    await redis.del(key);

    const whereClause = channel === OtpChannel.EMAIL ? { email } : { phone };
    let user = await User.findOne({ where: whereClause });

    if (!user) {
      if (!full_name) throw ApiError.badRequest('full_name is required for signup');

      user = await User.create({
        full_name,
        email: email || null,
        phone: phone || null,
        role: UserRole.USER,
        is_verified: true,
        is_email_verified: channel === OtpChannel.EMAIL,
        is_phone_verified: channel === OtpChannel.PHONE,
      });
    } else {
      const updates: Record<string, boolean> = { is_verified: true };
      if (channel === OtpChannel.EMAIL) updates.is_email_verified = true;
      if (channel === OtpChannel.PHONE) updates.is_phone_verified = true;
      await user.update(updates);
    }

    const tokenPayload = { id: user.id, role: user.role as UserRole };
    const access_token = signAccessToken(tokenPayload);
    const refresh_token = signRefreshToken(tokenPayload);

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_verified: user.is_verified,
      },
      access_token,
      refresh_token,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await User.findByPk(payload.id);
      if (!user) throw ApiError.unauthorized('User not found');

      const tokenPayload = { id: user.id, role: user.role as UserRole };
      const access_token = signAccessToken(tokenPayload);
      const refresh_token = signRefreshToken(tokenPayload);

      return { access_token, refresh_token };
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  }
}

export const authService = new AuthService();
