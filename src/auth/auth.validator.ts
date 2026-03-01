import { z } from 'zod';

export const sendOtpSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15).optional(),
  channel: z.enum(['email', 'phone']),
}).refine(
  (data) => {
    if (data.channel === 'email') return !!data.email;
    if (data.channel === 'phone') return !!data.phone;
    return false;
  },
  { message: 'Email required for email channel, phone required for phone channel' },
);

export const verifyOtpSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15).optional(),
  channel: z.enum(['email', 'phone']),
  otp: z.string().length(4),
  full_name: z.string().min(2).max(100).optional(), // for signup
}).refine(
  (data) => {
    if (data.channel === 'email') return !!data.email;
    if (data.channel === 'phone') return !!data.phone;
    return false;
  },
  { message: 'Email required for email channel, phone required for phone channel' },
);

export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
