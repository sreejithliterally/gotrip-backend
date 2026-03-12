import { z } from 'zod';

const optionalPhone = z
  .string()
  .transform((v) => (v === '' ? undefined : v))
  .pipe(z.string().min(10).max(15).optional());

const optionalEmail = z
  .string()
  .transform((v) => (v === '' ? undefined : v))
  .pipe(z.string().email().optional());

export const sendOtpSchema = z
  .discriminatedUnion('channel', [
    z.object({
      channel: z.literal('email'),
      email: optionalEmail.refine((v) => !!v, { message: 'email is required when channel is email' }),
      phone: optionalPhone,
      full_name: z.string().min(2).max(100).optional(),
    }),
    z.object({
      channel: z.literal('phone'),
      phone: optionalPhone.refine((v) => !!v, { message: 'phone is required when channel is phone' }),
      email: optionalEmail,
      full_name: z.string().min(2).max(100).optional(),
    }),
  ]);

export const verifyOtpSchema = z.discriminatedUnion('channel', [
  z.object({
    channel: z.literal('email'),
    email: optionalEmail.refine((v) => !!v, { message: 'email is required when channel is email' }),
    phone: optionalPhone,
    otp: z.string().length(4),
    full_name: z.string().min(2).max(100).optional(),
  }),
  z.object({
    channel: z.literal('phone'),
    phone: optionalPhone.refine((v) => !!v, { message: 'phone is required when channel is phone' }),
    email: optionalEmail,
    otp: z.string().length(4),
    full_name: z.string().min(2).max(100).optional(),
  }),
]);

export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
