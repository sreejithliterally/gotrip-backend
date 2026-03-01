import { z } from 'zod';

export const applyVendorSchema = z.object({
  business_name: z.string().min(2).max(200),
  description: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().min(10).max(15).optional(),
  address: z.string().optional(),
  pan_number: z.string().optional(),
  gst_number: z.string().optional(),
});

export const reviewVendorSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejection_reason: z.string().optional(),
});

export type ApplyVendorInput = z.infer<typeof applyVendorSchema>;
export type ReviewVendorInput = z.infer<typeof reviewVendorSchema>;
