import { z } from 'zod';

export const stockMovementSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  quantity: z.number().int(),
  movementType: z.enum(['IN', 'OUT', 'RESERVE', 'RELEASE', 'ADJUST']),
  notes: z.string().optional(),
});

export const createTransferSchema = z.object({
  sourceWarehouseId: z.string().uuid(),
  destinationWarehouseId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1),
});

export const updateTransferStatusSchema = z.object({
  status: z.enum(['IN_TRANSIT', 'COMPLETED', 'CANCELLED']),
});
