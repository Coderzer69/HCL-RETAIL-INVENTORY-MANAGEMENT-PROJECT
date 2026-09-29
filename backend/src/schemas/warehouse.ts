import { z } from 'zod';

export const createWarehouseSchema = z.object({
  name: z.string().min(1),
  locationCode: z.string().min(1),
  address: z.string().min(1),
  managerId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export const updateWarehouseSchema = createWarehouseSchema.partial();
