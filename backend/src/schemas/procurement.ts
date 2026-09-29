import { z } from 'zod';

export const createPOSchema = z.object({
  supplierId: z.string().uuid(),
  destinationWarehouseId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantityOrdered: z.number().int().positive(),
  })).min(1),
});

export const updatePOStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SUBMITTED', 'CANCELLED']),
});

export const receiveGoodsSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantityReceived: z.number().int().positive(),
  })).min(1),
});
