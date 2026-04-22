import { z } from 'zod';

export const createBookingSchema = z.object({
  listing_id: z.string().uuid(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  guests: z.number().int().positive().default(1),
  rooms: z.number().int().positive().default(1),
});

export const cancelBookingSchema = z.object({
  cancellation_reason: z.string().min(5).optional(),
});

export const setAvailabilitySchema = z.object({
  listing_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  total_units: z.number().int().positive(),
  available_units: z.number().int().min(0),
  price: z.number().positive(),
});

export const bulkAvailabilitySchema = z.object({
  listing_id: z.string().uuid(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  total_units: z.number().int().positive(),
  price: z.number().positive(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>;
export type BulkAvailabilityInput = z.infer<typeof bulkAvailabilitySchema>;
