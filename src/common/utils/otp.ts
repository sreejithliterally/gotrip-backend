import crypto from 'crypto';

/**
 * Generate a 4-digit OTP
 */
export function generateOtp(): string {
  return crypto.randomInt(1000, 9999).toString();
}

/**
 * Build Redis key for OTP storage
 */
export function otpRedisKey(channel: 'email' | 'phone', identifier: string): string {
  return `otp:${channel}:${identifier}`;
}
