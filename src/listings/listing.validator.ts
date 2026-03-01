import { z } from 'zod';

export const createListingSchema = z.object({
  category_id: z.string().uuid(),
  title: z.string().min(3).max(300),
  description: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  price_start: z.number().positive(),
  amenities: z.array(z.string()).optional(),
  policies: z.record(z.string(), z.unknown()).optional(),
  max_guests: z.number().int().positive().optional(),
});

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export const listingQuerySchema = z.object({
  category_id: z.string().uuid().optional(),
  location: z.string().optional(),
  min_price: z.string().optional(),
  max_price: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort_by: z.enum(['price_start', 'created_at']).optional(),
  sort_order: z.enum(['ASC', 'DESC']).optional(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
