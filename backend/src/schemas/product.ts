import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1),
  parentId: z.string().uuid().optional(),
  description: z.string().optional(),
});

export const createProductSchema = z.object({
  sku: z.string().min(1),
  barcode: z.string().optional(),
  name: z.string().min(1),
  categoryId: z.string().uuid().optional(),
  description: z.string().optional(),
  basePrice: z.number().min(0),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();
