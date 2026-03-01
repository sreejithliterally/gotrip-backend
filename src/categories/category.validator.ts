import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  icon_url: z.string().url().optional(),
  image_url: z.string().url().optional(),
  parent_id: z.string().uuid().optional().nullable(),
  type: z.enum(['hotel', 'activity', 'camping', 'package']).optional().nullable(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
